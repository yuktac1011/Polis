import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'polis.db');
const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS mlas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      constituency TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      aadhar TEXT PRIMARY KEY,
      username TEXT,
      role TEXT NOT NULL CHECK(role IN ('ROLE_CITIZEN', 'ROLE_MLA')),
      citizen_hash TEXT NOT NULL,
      mla_id TEXT,
      FOREIGN KEY(mla_id) REFERENCES mlas(id)
    );

    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('New', 'In Progress', 'Resolved')),
      x_coord REAL NOT NULL,
      y_coord REAL NOT NULL,
      constituency_id TEXT NOT NULL,
      reporter_hash TEXT NOT NULL,
      resolution_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(constituency_id) REFERENCES mlas(id)
    );

    CREATE TABLE IF NOT EXISTS upvotes (
      issue_id INTEGER,
      citizen_hash TEXT,
      PRIMARY KEY(issue_id, citizen_hash),
      FOREIGN KEY(issue_id) REFERENCES issues(id)
    );
  `);

  // Clear and re-seed to avoid foreign key violations with mock data
  db.exec('DELETE FROM issues');
  db.exec('DELETE FROM users');
  db.exec('DELETE FROM mlas');
  
  const mlasCount = db.prepare('SELECT COUNT(*) as count FROM mlas').get() as { count: number };
  if (mlasCount.count === 0) {
    const mlas = [
      { ward: "A Ward", mla_name: "Rahul Narwekar", constituency: "Colaba (187)", party: "BJP" },
      { ward: "B Ward", mla_name: "Amin Patel", constituency: "Mumbadevi (186)", party: "INC" },
      { ward: "B Ward 2", mla_name: "Manoj Jamsutkar", constituency: "Byculla (184)", party: "SS-UBT" },
      { ward: "C Ward", mla_name: "Amin Patel", constituency: "Mumbadevi (186)", party: "INC" },
      { ward: "C Ward 2", mla_name: "Mangal Prabhat Lodha", constituency: "Malabar Hill (185)", party: "BJP" },
      { ward: "D Ward", mla_name: "Mangal Prabhat Lodha", constituency: "Malabar Hill (185)", party: "BJP" },
      { ward: "E Ward", mla_name: "Manoj Jamsutkar", constituency: "Byculla (184)", party: "SS-UBT" },
      { ward: "F/N Ward", mla_name: "Kalidas Kolambkar", constituency: "Wadala (180)", party: "BJP" },
      { ward: "G/S Ward", mla_name: "Aaditya Thackeray", constituency: "Worli (182)", party: "SS-UBT" },
      { ward: "K/W Ward", mla_name: "Ameet Satam", constituency: "Andheri West (165)", party: "BJP" },
      { ward: "M/E Ward", mla_name: "Abu Azmi", constituency: "Mankhurd (171)", party: "SP" }
    ];

    const insertMla = db.prepare('INSERT INTO mlas (id, name, constituency) VALUES (?, ?, ?)');
    mlas.forEach(m => {
      // Use ward as ID, but handle duplicates by appending a suffix if needed
      // Actually, let's just use a unique ID derived from ward and MLA
      const id = m.ward.toLowerCase().replace(/[\/\s]/g, '_');
      insertMla.run(id, `${m.mla_name} (${m.party})`, m.constituency);
    });
  }
}

export default db;
