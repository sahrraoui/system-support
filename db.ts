import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database(path.join(__dirname, '..', 'data', 'support.db'));

db.pragma('journal_mode = WAL');

const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
db.exec(schema);

export default db;