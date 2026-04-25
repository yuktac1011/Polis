import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'polis.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  // Run all schema creation in a single transaction
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS upvotes (
      issue_id INTEGER NOT NULL,
      citizen_hash TEXT NOT NULL,
      PRIMARY KEY(issue_id, citizen_hash),
      FOREIGN KEY(issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);

  // Seed MLAs ONLY if the table is empty — never wipe on restart
  const mlasCount = (db.prepare('SELECT COUNT(*) as count FROM mlas').get() as { count: number }).count;
  if (mlasCount === 0) {
    // IDs are derived the same way the GeoJSON ward name is converted by the frontend:
    // feature.properties.Name.toLowerCase().replace(/[\/\s]/g, '_')
    const mlas = [
      { ward: 'A Ward',   name: 'Rahul Narwekar',       constituency: 'Colaba (187)',        party: 'BJP',    zone: 'Zone 1' },
      { ward: 'B Ward',   name: 'Amin Patel',            constituency: 'Mumbadevi (186)',      party: 'INC',    zone: 'Zone 1' },
      { ward: 'C Ward',   name: 'Mangal Prabhat Lodha',  constituency: 'Malabar Hill (185)',   party: 'BJP',    zone: 'Zone 1' },
      { ward: 'D Ward',   name: 'Mangal Prabhat Lodha',  constituency: 'Malabar Hill (185)',   party: 'BJP',    zone: 'Zone 1' },
      { ward: 'E Ward',   name: 'Manoj Jamsutkar',       constituency: 'Byculla (184)',        party: 'SS-UBT', zone: 'Zone 1' },
      { ward: 'F/N Ward', name: 'Kalidas Kolambkar',     constituency: 'Wadala (180)',         party: 'BJP',    zone: 'Zone 2' },
      { ward: 'F/S Ward', name: 'Kalidas Kolambkar',     constituency: 'Wadala (180)',         party: 'BJP',    zone: 'Zone 2' },
      { ward: 'G/N Ward', name: 'Milind Deora',          constituency: 'Colaba (187)',         party: 'INC',    zone: 'Zone 2' },
      { ward: 'G/S Ward', name: 'Aaditya Thackeray',     constituency: 'Worli (182)',          party: 'SS-UBT', zone: 'Zone 2' },
      { ward: 'H/E Ward', name: 'Ramesh Latke',          constituency: 'Andheri East (166)',   party: 'SS-UBT', zone: 'Zone 3' },
      { ward: 'H/W Ward', name: 'Ameet Satam',           constituency: 'Andheri West (165)',   party: 'BJP',    zone: 'Zone 3' },
      { ward: 'K/E Ward', name: 'Sunil Prabhu',          constituency: 'Ghatkopar East (155)', party: 'SS-UBT', zone: 'Zone 5' },
      { ward: 'K/W Ward', name: 'Ameet Satam',           constituency: 'Andheri West (165)',   party: 'BJP',    zone: 'Zone 3' },
      { ward: 'L Ward',   name: 'Ashish Shelar',         constituency: 'Bandra West (167)',    party: 'BJP',    zone: 'Zone 4' },
      { ward: 'M/E Ward', name: 'Abu Azmi',              constituency: 'Mankhurd (171)',       party: 'SP',     zone: 'Zone 5' },
      { ward: 'M/W Ward', name: 'Abu Azmi',              constituency: 'Mankhurd (171)',       party: 'SP',     zone: 'Zone 5' },
      { ward: 'N Ward',   name: 'Mihir Kotecha',         constituency: 'Mulund (155)',         party: 'BJP',    zone: 'Zone 6' },
      { ward: 'P/N Ward', name: 'Vinod Ghosalkar',       constituency: 'Dahisar (160)',        party: 'SS-UBT', zone: 'Zone 7' },
      { ward: 'P/S Ward', name: 'Vinod Ghosalkar',       constituency: 'Dahisar (160)',        party: 'SS-UBT', zone: 'Zone 7' },
      { ward: 'R/C Ward', name: 'Suresh Prabhu',         constituency: 'Borivali (158)',       party: 'BJP',    zone: 'Zone 7' },
      { ward: 'R/N Ward', name: 'Suresh Prabhu',         constituency: 'Borivali (158)',       party: 'BJP',    zone: 'Zone 7' },
      { ward: 'R/S Ward', name: 'Suresh Prabhu',         constituency: 'Borivali (158)',       party: 'BJP',    zone: 'Zone 7' },
      { ward: 'S Ward',   name: 'Prakash Surve',         constituency: 'Magathane (162)',      party: 'BJP',    zone: 'Zone 7' },
      { ward: 'T Ward',   name: 'Anil Gote',             constituency: 'Mulund (154)',         party: 'BJP',    zone: 'Zone 6' },
      { ward: 'Dharavi',  name: 'Jyoti Eknath Gaikwad',  constituency: 'Dharavi (175)',        party: 'INC',    zone: 'Zone 2' },
    ];

    const insertMla = db.prepare('INSERT OR IGNORE INTO mlas (id, name, constituency, party, ward, zone) VALUES (?, ?, ?, ?, ?, ?)');
    const insertMany = db.transaction((items: typeof mlas) => {
      for (const m of items) {
        // Generate the ID EXACTLY as the frontend does:
        // ward.toLowerCase().replace(/[\/\s]/g, '_')
        const id = m.ward.toLowerCase().replace(/[\/\s]/g, '_');
        insertMla.run(id, m.name, m.constituency, m.party, m.ward, m.zone);
      }
    });
    insertMany(mlas);
    console.log(`[DB] Seeded ${mlas.length} MLA records.`);
  }
}

export function getAllMlas() {
  return db.prepare('SELECT * FROM mlas').all();
}

export default db;
