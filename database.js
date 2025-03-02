import sqlite3 from 'sqlite3'
const db = new sqlite3.Database('duels.db')

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS duels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      messageId TEXT UNIQUE,
      participant1 TEXT,
      participant2 TEXT,
      rounds TEXT,
      score TEXT,
      winner TEXT
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT,
      guild TEXT,
      nationality TEXT,
      sector TEXT,
      playstyle TEXT,
      alignment TEXT,
      flexibility INTEGER,
      speed INTEGER,
      aim INTEGER,
      acc INTEGER,
      adp INTEGER,
      ps INTEGER,
      overall INTEGER
    )
  `)
})

export default db
