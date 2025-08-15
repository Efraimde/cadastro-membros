const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const file = path.join(__dirname, 'membros.json');
const adapter = new JSONFile(file);

// Passando dados padrão para evitar o erro
const db = new Low(adapter, { membros: [] });

async function initDB() {
  await db.read();
  db.data ||= { membros: [] }; // garante que sempre exista
  await db.write();
}

initDB();

module.exports = db;
