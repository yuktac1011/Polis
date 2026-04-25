import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'polis.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrent read performance
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

export function initDb() {
  // Run all schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS mlas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      constituency TEXT NOT NULL,
      party TEXT,
      ward TEXT,
      zone TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ROLE_CITIZEN', 'ROLE_MLA')),
      citizen_hash TEXT NOT NULL,
      mla_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(mla_id) REFERENCES mlas(id)
    );

    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'In Progress', 'Resolved')),
      x_coord REAL NOT NULL,
      y_coord REAL NOT NULL,
      constituency_id TEXT NOT NULL,
      reporter_hash TEXT NOT NULL,
      resolution_summary TEXT,
      parent_issue_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(parent_issue_id) REFERENCES issues(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS upvotes (
      issue_id INTEGER NOT NULL,
      citizen_hash TEXT NOT NULL,
      PRIMARY KEY(issue_id, citizen_hash),
      FOREIGN KEY(issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);

  // Seed MLAs ONLY if the table is empty
  const mlasCountResult = db.prepare('SELECT COUNT(*) as count FROM mlas').get() as { count: number };
  const mlasCount = mlasCountResult ? mlasCountResult.count : 0;
  
  if (mlasCount === 0) {
    const mlas = [
      { ward: 'A Ward',   name: 'Rahul Narwekar',       constituency: 'Colaba (187)',        party: 'BJP',    zone: 'Zone 1' },
      { ward: 'B Ward',   name: 'Amin Patel',            constituency: 'Mumbadevi (186)',      party: 'INC',    zone: 'Zone 1' },
      { ward: 'C Ward',   name: 'Mangal Prabhat Lodha',  constituency: 'Malabar Hill (185)',   party: 'BJP',    zone: 'Zone 1' },
      { ward: 'D Ward',   name: 'Mangal Prabhat Lodha',  constituency: 'Malabar Hill (185)',   party: 'BJP',    zone: 'Zone 1' },
      { ward: 'E Ward',   name: 'Manoj Jamsutkar',       constituency: 'Byculla (184)',        party: 'SS-UBT', zone: 'Zone 1' },
      { ward: 'F/N Ward', name: 'Kalidas Kolambkar',     constituency: 'Wadala (180)',         party: 'BJP',    zone: 'Zone 2' },
      { ward: 'F/S Ward', name: 'Kalidas Kolambkar',     constituency: 'Wadala (180)',         party: 'BJP',    zone: 'Zone 2' },
      { ward: 'G/N Ward', name: 'Zeeshan Siddique',      constituency: 'Vandre East (176)',    party: 'INC',    zone: 'Zone 2' },
      { ward: 'G/S Ward', name: 'Aaditya Thackeray',     constituency: 'Worli (182)',          party: 'SS-UBT', zone: 'Zone 2' },
      { ward: 'H/E Ward', name: 'Ramesh Latke',          constituency: 'Andheri East (166)',   party: 'SS-UBT', zone: 'Zone 3' },
      { ward: 'H/W Ward', name: 'Ashish Shelar',         constituency: 'Bandra West (167)',    party: 'BJP',    zone: 'Zone 3' },
      { ward: 'K/E Ward', name: 'Ravindra Waikar',       constituency: 'Jogeshwari East (158)', party: 'SS-UBT', zone: 'Zone 3' },
      { ward: 'K/W Ward', name: 'Ameet Satam',           constituency: 'Andheri West (165)',   party: 'BJP',    zone: 'Zone 3' },
      { ward: 'L Ward',   name: 'Dilip Lande',           constituency: 'Chandivali (168)',     party: 'SHS',    zone: 'Zone 4' },
      { ward: 'M/E Ward', name: 'Abu Azmi',              constituency: 'Mankhurd (171)',       party: 'SP',     zone: 'Zone 5' },
      { ward: 'M/W Ward', name: 'Abu Azmi',              constituency: 'Mankhurd (171)',       party: 'SP',     zone: 'Zone 5' },
      { ward: 'N Ward',   name: 'Mihir Kotecha',         constituency: 'Mulund (155)',         party: 'BJP',    zone: 'Zone 6' },
      { ward: 'P/N Ward', name: 'Aslam Shaikh',          constituency: 'Malad West (162)',     party: 'INC',    zone: 'Zone 7' },
      { ward: 'P/S Ward', name: 'Vidya Thakur',          constituency: 'Goregaon (163)',       party: 'BJP',    zone: 'Zone 7' },
      { ward: 'R/C Ward', name: 'Sunil Rane',            constituency: 'Borivali (152)',       party: 'BJP',    zone: 'Zone 7' },
      { ward: 'R/N Ward', name: 'Manisha Chaudhary',     constituency: 'Dahisar (153)',        party: 'BJP',    zone: 'Zone 7' },
      { ward: 'R/S Ward', name: 'Yogesh Sagar',          constituency: 'Charkop (161)',        party: 'BJP',    zone: 'Zone 7' },
      { ward: 'S Ward',   name: 'Prakash Surve',         constituency: 'Magathane (154)',      party: 'SHS',    zone: 'Zone 7' },
      { ward: 'T Ward',   name: 'Tara Singh',            constituency: 'Mulund (155)',         party: 'BJP',    zone: 'Zone 6' },
      { ward: 'Dharavi',  name: 'Varsha Gaikwad',        constituency: 'Dharavi (178)',        party: 'INC',    zone: 'Zone 2' },
    ];

    const insertMla = db.prepare('INSERT OR IGNORE INTO mlas (id, name, constituency, party, ward, zone) VALUES (?, ?, ?, ?, ?, ?)');
    
    db.exec('BEGIN');
    try {
      for (const m of mlas) {
        const id = m.ward.toLowerCase().replace(/[\/\s]/g, '_');
        insertMla.run(id, m.name, m.constituency, m.party, m.ward, m.zone);
      }
      db.exec('COMMIT');
      console.log(`[DB] Seeded ${mlas.length} MLA records.`);
    } catch (e) {
      db.exec('ROLLBACK');
      console.error('[DB] Seeding failed:', e);
    }
  }
}

export function getAllMlas() {
  return db.prepare('SELECT * FROM mlas').all();
}

export default db;
