import db, { initDb } from './db';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';

const generateCitizenHash = (email: string, username: string) =>
  crypto.createHash('sha256').update(email + username).digest('hex').substring(0, 8).toUpperCase();

async function seed() {
  console.log('🌱 Seeding production dummy data...');
  initDb();

  const passwordHash = await bcrypt.hash('polis123', 10);

  const mlas = [
    {
      id: crypto.randomUUID(),
      email: 'rahul.narwekar@polis.gov',
      username: 'Rahul Narwekar',
      role: 'ROLE_MLA',
      mla_id: 'a_ward', // colaba
      citizen_hash: generateCitizenHash('rahul.narwekar@polis.gov', 'Rahul Narwekar')
    },
    {
      id: crypto.randomUUID(),
      email: 'aaditya.thackeray@polis.gov',
      username: 'Aaditya Thackeray',
      role: 'ROLE_MLA',
      mla_id: 'g_s_ward', // worli
      citizen_hash: generateCitizenHash('aaditya.thackeray@polis.gov', 'Aaditya Thackeray')
    }
  ];

  const citizens = [
    {
      id: crypto.randomUUID(),
      email: 'priya@gmail.com',
      username: 'Priya Sharma',
      role: 'ROLE_CITIZEN',
      citizen_hash: generateCitizenHash('priya@gmail.com', 'Priya Sharma')
    },
    {
      id: crypto.randomUUID(),
      email: 'arjun@gmail.com',
      username: 'Arjun Mehta',
      role: 'ROLE_CITIZEN',
      citizen_hash: generateCitizenHash('arjun@gmail.com', 'Arjun Mehta')
    },
    {
      id: crypto.randomUUID(),
      email: 'sara@gmail.com',
      username: 'Sara Khan',
      role: 'ROLE_CITIZEN',
      citizen_hash: generateCitizenHash('sara@gmail.com', 'Sara Khan')
    },
    {
      id: crypto.randomUUID(),
      email: 'rohit@gmail.com',
      username: 'Rohit Deshmukh',
      role: 'ROLE_CITIZEN',
      citizen_hash: generateCitizenHash('rohit@gmail.com', 'Rohit Deshmukh')
    }
  ];

  db.exec('BEGIN');
  try {
    const insertUser = db.prepare(
      'INSERT OR IGNORE INTO users (id, email, password_hash, username, role, citizen_hash, mla_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    for (const u of [...mlas, ...citizens]) {
      insertUser.run(u.id, u.email, passwordHash, u.username, u.role, u.citizen_hash, (u as any).mla_id || null);
    }

    // Add some initial projects for MLAs
    const insertProject = db.prepare(
      'INSERT INTO projects (mla_id, title, description, status, budget) VALUES (?, ?, ?, ?, ?)'
    );

    insertProject.run('a_ward', 'Colaba Promenade Restoration', 'Complete overhaul of the sea-facing walkway with new lighting and seating.', 'In Progress', '₹4.5 Crores');
    insertProject.run('g_s_ward', 'Worli Zero-Waste Initiative', 'Implementing 100% waste segregation and local composting units.', 'Planning', '₹85 Lakhs');

    db.exec('COMMIT');
    console.log('✅ Seeded 2 MLAs, 4 Citizens, and 2 Projects.');
    console.log('\n--- Credentials ---');
    console.log('Password for all: polis123');
    console.log('MLAs: rahul.narwekar@polis.gov, aaditya.thackeray@polis.gov');
    console.log('Citizens: priya@gmail.com, arjun@gmail.com, sara@gmail.com, rohit@gmail.com');
  } catch (e) {
    db.exec('ROLLBACK');
    console.error('❌ Seeding failed:', e);
  }
}

seed();
