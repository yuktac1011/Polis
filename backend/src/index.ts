import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import crypto from 'crypto';
import db, { initDb } from './db';
import { validateAadhar } from './auth';

const app = express();
app.use(cors());
app.use(express.json());

initDb();

const generateCitizenHash = (aadhar: string, username: string) => {
  return crypto.createHash('sha256').update(aadhar + username).digest('hex').substring(0, 8);
};

const AuthSchema = z.object({
  aadhar: z.string().length(12),
  username: z.string().min(3)
});

app.post('/api/auth', (req, res) => {
  try {
    const { aadhar, username } = AuthSchema.parse(req.body);
    
    if (!validateAadhar(aadhar)) {
      return res.status(400).json({ error: 'Invalid Aadhar' });
    }

    const citizen_hash = generateCitizenHash(aadhar, username);
    let role = 'ROLE_CITIZEN';
    let mla_id = null;

    if (aadhar.endsWith('00')) {
      role = 'ROLE_MLA';
      const mlas = db.prepare('SELECT id FROM mlas').all() as { id: string }[];
      const suffix = parseInt(aadhar.slice(9, 12));
      const mlaIndex = (suffix / 100) - 1;
      if (mlaIndex >= 0 && mlaIndex < mlas.length) {
        mla_id = mlas[mlaIndex].id;
      } else {
        mla_id = mlas[0].id;
      }
    }

    const userExists = db.prepare('SELECT * FROM users WHERE aadhar = ?').get(aadhar);
    if (!userExists) {
      db.prepare('INSERT INTO users (aadhar, username, role, citizen_hash, mla_id) VALUES (?, ?, ?, ?, ?)').run(aadhar, username, role, citizen_hash, mla_id);
    } else {
      const user = userExists as any;
      role = user.role;
      mla_id = user.mla_id;
    }

    const mlaInfo = mla_id ? db.prepare('SELECT * FROM mlas WHERE id = ?').get(mla_id) : null;

    res.json({
      success: true,
      user: {
        aadhar,
        username,
        role,
        citizenHash: citizen_hash,
        mla_id,
        mla_info: mlaInfo
      }
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

app.get('/api/issues', (req, res) => {
  const issues = db.prepare(`
    SELECT i.*, 
           (SELECT COUNT(*) FROM upvotes WHERE issue_id = i.id) as upvotes
    FROM issues i
  `).all();
  res.json(issues);
});

const IssueSchema = z.object({
  category: z.string(),
  title: z.string(),
  description: z.string(),
  x_coord: z.number(),
  y_coord: z.number(),
  constituency_id: z.string(),
  reporter_hash: z.string()
});

app.post('/api/issues', (req, res) => {
  try {
    const data = IssueSchema.parse(req.body);
    const stmt = db.prepare(`
      INSERT INTO issues (category, title, description, status, x_coord, y_coord, constituency_id, reporter_hash)
      VALUES (?, ?, ?, 'New', ?, ?, ?, ?)
    `);
    const info = stmt.run(data.category, data.title, data.description, data.x_coord, data.y_coord, data.constituency_id, data.reporter_hash);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid input' });
  }
});

app.patch('/api/issues/:id', (req, res) => {
  const { status, resolution_summary } = req.body;
  if (!['New', 'In Progress', 'Resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    db.prepare('UPDATE issues SET status = ?, resolution_summary = ? WHERE id = ?').run(status, resolution_summary || null, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/issues/:id/upvote', (req, res) => {
  const { citizen_hash } = req.body;
  if (!citizen_hash) return res.status(400).json({ error: 'Missing citizen hash' });
  
  try {
    db.prepare('INSERT OR IGNORE INTO upvotes (issue_id, citizen_hash) VALUES (?, ?)').run(req.params.id, citizen_hash);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/leaderboard', (req, res) => {
  const stats = db.prepare(`
    SELECT m.id, m.name, m.constituency,
           COUNT(i.id) as total_issues,
           SUM(CASE WHEN i.status = 'Resolved' THEN 1 ELSE 0 END) as resolved_issues
    FROM mlas m
    LEFT JOIN issues i ON m.id = i.constituency_id
    GROUP BY m.id
  `).all();
  
  res.json(stats);
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
