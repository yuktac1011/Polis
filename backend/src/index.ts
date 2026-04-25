import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { z, ZodError } from 'zod';
import crypto from 'crypto';
import db, { initDb, getAllMlas } from './db';
import * as bcrypt from 'bcryptjs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

app.use(cors());
app.use(express.json());

// ─── Socket.io ───────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('📡 Client disconnected'));
});

// ─── DB Init ─────────────────────────────────────────────────────────────────
initDb();

// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateCitizenHash = (email: string, username: string) =>
  crypto.createHash('sha256').update(email + username).digest('hex').substring(0, 8).toUpperCase();

// ─── Validation Schemas ───────────────────────────────────────────────────────
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  mlaCode: z.string().optional(),
  mlaWardId: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const IssueSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  x_coord: z.number(),
  y_coord: z.number(),
  constituency_id: z.string().min(1),
  reporter_hash: z.string().min(1),
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username, mlaCode, mlaWardId } = RegisterSchema.parse(req.body);

    const userExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (userExists) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const citizen_hash = generateCitizenHash(email, username);
    let role = 'ROLE_CITIZEN';
    let mla_id: string | null = null;

    if (mlaCode === 'POLIS_MLA_2024') {
      role = 'ROLE_MLA';
      if (mlaWardId) {
        // Use the specific ward the MLA selects
        const mlaRecord = db.prepare('SELECT id FROM mlas WHERE id = ?').get(mlaWardId) as any;
        if (mlaRecord) {
          mla_id = mlaRecord.id;
        }
      }
      if (!mla_id) {
        // Fallback: assign first available ward
        const mlas = db.prepare('SELECT id FROM mlas').all() as { id: string }[];
        mla_id = mlas.length > 0 ? mlas[0].id : null;
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    db.prepare(
      'INSERT INTO users (id, email, password_hash, username, role, citizen_hash, mla_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, email, password_hash, username, role, citizen_hash, mla_id);

    const mlaInfo = mla_id ? db.prepare('SELECT * FROM mlas WHERE id = ?').get(mla_id) : null;

    return res.status(201).json({
      success: true,
      user: { id, email, username, role, citizenHash: citizen_hash, mla_id, mla_info: mlaInfo },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    console.error('[Register]', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const mlaInfo = user.mla_id
      ? db.prepare('SELECT * FROM mlas WHERE id = ?').get(user.mla_id)
      : null;

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        citizenHash: user.citizen_hash,
        mla_id: user.mla_id,
        mla_info: mlaInfo,
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    console.error('[Login]', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// ─── MLA Routes ───────────────────────────────────────────────────────────────
app.get('/api/mlas', (_req: Request, res: Response) => {
  const mlas = getAllMlas();
  return res.json(mlas);
});

// ─── Issues Routes ────────────────────────────────────────────────────────────
app.get('/api/issues', (_req: Request, res: Response) => {
  const issues = db
    .prepare(
      `SELECT i.*, (SELECT COUNT(*) FROM upvotes WHERE issue_id = i.id) as upvotes
       FROM issues i
       ORDER BY i.created_at DESC`
    )
    .all();
  return res.json(issues);
});

app.post('/api/issues', (req: Request, res: Response) => {
  try {
    const data = IssueSchema.parse(req.body);

    // Validate that the constituency_id exists — give a useful error if not
    const wardExists = db.prepare('SELECT id FROM mlas WHERE id = ?').get(data.constituency_id);
    if (!wardExists) {
      // Don't fail — just store the issue without the FK constraint for resilience
      // Instead, insert without FK enforcement for unknown wards
      console.warn(`[Issues] Unknown ward: ${data.constituency_id} — inserting without MLA linkage`);
    }

    const info = db
      .prepare(
        `INSERT INTO issues (category, title, description, status, x_coord, y_coord, constituency_id, reporter_hash)
         VALUES (?, ?, ?, 'New', ?, ?, ?, ?)`
      )
      .run(
        data.category,
        data.title,
        data.description,
        data.x_coord,
        data.y_coord,
        data.constituency_id,
        data.reporter_hash
      );

    const newIssue = { id: info.lastInsertRowid, ...data, status: 'New', upvotes: 0, created_at: new Date().toISOString() };
    io.emit('issue_created', newIssue);

    return res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    console.error('[Create Issue]', err);
    return res.status(500).json({ error: 'Failed to create issue' });
  }
});

app.patch('/api/issues/:id', (req: Request, res: Response) => {
  const { status, resolution_summary } = req.body;
  const validStatuses = ['New', 'In Progress', 'Resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }
  try {
    const result = db
      .prepare('UPDATE issues SET status = ?, resolution_summary = ? WHERE id = ?')
      .run(status, resolution_summary || null, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const updatedIssue = db.prepare('SELECT i.*, (SELECT COUNT(*) FROM upvotes WHERE issue_id = i.id) as upvotes FROM issues i WHERE i.id = ?').get(req.params.id);
    io.emit('issue_updated', updatedIssue);

    return res.json({ success: true });
  } catch (err) {
    console.error('[Update Issue]', err);
    return res.status(500).json({ error: 'Update failed' });
  }
});

app.post('/api/issues/batch', (req: Request, res: Response) => {
  const { ids, status, resolution_summary } = req.body;
  if (!Array.isArray(ids) || !status) {
    return res.status(400).json({ error: 'ids (array) and status are required' });
  }
  try {
    const stmt = db.prepare('UPDATE issues SET status = ?, resolution_summary = ? WHERE id = ?');
    db.exec('BEGIN');
    for (const id of ids) {
      stmt.run(status, resolution_summary || null, id);
    }
    db.exec('COMMIT');
    return res.json({ success: true, count: ids.length });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('[Batch Update]', err);
    return res.status(500).json({ error: 'Batch update failed' });
  }
});

app.patch('/api/issues/:id/reopen', (req: Request, res: Response) => {
  try {
    const result = db
      .prepare("UPDATE issues SET status = 'In Progress', resolution_summary = NULL WHERE id = ?")
      .run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[Reopen Issue]', err);
    return res.status(500).json({ error: 'Reopen failed' });
  }
});

app.post('/api/issues/:id/upvote', (req: Request, res: Response) => {
  const { citizen_hash } = req.body;
  if (!citizen_hash) return res.status(400).json({ error: 'citizen_hash is required' });
  try {
    db.prepare(
      'INSERT OR IGNORE INTO upvotes (issue_id, citizen_hash) VALUES (?, ?)'
    ).run(req.params.id, citizen_hash);

    const updatedIssue = db.prepare('SELECT i.*, (SELECT COUNT(*) FROM upvotes WHERE issue_id = i.id) as upvotes FROM issues i WHERE i.id = ?').get(req.params.id);
    io.emit('issue_updated', updatedIssue);

    return res.json({ success: true });
  } catch (err) {
    console.error('[Upvote]', err);
    return res.status(500).json({ error: 'Upvote failed' });
  }
});

app.post('/api/issues/group', (req: Request, res: Response) => {
  const { primaryId, otherIds } = req.body;
  if (!primaryId || !Array.isArray(otherIds)) {
    return res.status(400).json({ error: 'primaryId and otherIds (array) are required' });
  }
  try {
    const stmt = db.prepare("UPDATE issues SET parent_issue_id = ?, status = 'Resolved', resolution_summary = 'Merged into primary issue #' || ? WHERE id = ?");
    db.exec('BEGIN');
    for (const id of otherIds) {
      stmt.run(primaryId, primaryId, id);
    }
    db.exec('COMMIT');
    return res.json({ success: true, grouped: otherIds.length });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('[Group Issues]', err);
    return res.status(500).json({ error: 'Grouping failed' });
  }
});

// ─── Trending Issues ─────────────────────────────────────────────────────────
app.get('/api/issues/trending', (_req: Request, res: Response) => {
  const issues = db.prepare(`
    SELECT i.*, (SELECT COUNT(*) FROM upvotes WHERE issue_id = i.id) as upvotes
    FROM issues i
    ORDER BY upvotes DESC, i.created_at DESC
    LIMIT 5
  `).all();
  return res.json(issues);
});

// ─── Project Routes ──────────────────────────────────────────────────────────
app.get('/api/projects', (req: Request, res: Response) => {
  const { mla_id } = req.query;
  let projects;
  if (mla_id) {
    projects = db.prepare('SELECT * FROM projects WHERE mla_id = ? ORDER BY created_at DESC').all(mla_id);
  } else {
    projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  }
  return res.json(projects);
});

app.post('/api/projects', (req: Request, res: Response) => {
  const { mla_id, title, description, status, budget } = req.body;
  if (!mla_id || !title) return res.status(400).json({ error: 'mla_id and title required' });
  try {
    const info = db.prepare(
      'INSERT INTO projects (mla_id, title, description, status, budget) VALUES (?, ?, ?, ?, ?)'
    ).run(mla_id, title, description || '', status || 'Planning', budget || null);
    return res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error('[Create Project]', err);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

app.patch('/api/projects/:id', (req: Request, res: Response) => {
  const { status, title, description, budget } = req.body;
  try {
    const result = db.prepare(
      'UPDATE projects SET status = COALESCE(?, status), title = COALESCE(?, title), description = COALESCE(?, description), budget = COALESCE(?, budget) WHERE id = ?'
    ).run(status, title, description, budget, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Project not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('[Update Project]', err);
    return res.status(500).json({ error: 'Update failed' });
  }
});

// ─── Leaderboard Route ────────────────────────────────────────────────────────
app.get('/api/leaderboard', (_req: Request, res: Response) => {
  const stats = db
    .prepare(
      `SELECT m.id, m.name, m.constituency, m.party, m.ward, m.zone,
              COUNT(i.id) as total_issues,
              SUM(CASE WHEN i.status = 'Resolved' THEN 1 ELSE 0 END) as resolved_issues,
              SUM(CASE WHEN i.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_issues,
              SUM(CASE WHEN i.status = 'New' THEN 1 ELSE 0 END) as new_issues
       FROM mlas m
       LEFT JOIN issues i ON m.id = i.constituency_id
       GROUP BY m.id
       ORDER BY resolved_issues DESC, total_issues DESC`
    )
    .all();
  return res.json(stats);
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Error]', err);
  return res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ Polis Backend running on http://localhost:${PORT}`);
  console.log(`   WebSocket: enabled`);
  console.log(`   CORS: enabled`);
});

export default app;
