const { Low } = require('lowdb');
const { JSONFileSync } = require('lowdb/node'); // versão síncrona
const path = require('path');

const file = path.join(__dirname, 'membros.json');
const adapter = new JSONFileSync(file); // usa escrita síncrona

const db = new Low(adapter, { membros: [] });

// Inicializa dados padrão
db.read();
db.data ||= { membros: [] };

module.exports = db;
