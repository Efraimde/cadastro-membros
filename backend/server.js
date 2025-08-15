const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Servir frontend estático
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

/* ========== ROTAS API ========== */
app.get('/api/membros', async (req,res) => {
  await db.read();
  res.json(db.data.membros.sort((a,b)=>b.id - a.id));
});

app.get('/api/membros/:id', async (req,res) => {
  await db.read();
  const membro = db.data.membros.find(m => m.id === Number(req.params.id));
  if(!membro) return res.status(404).json({error:'Membro não encontrado'});
  res.json(membro);
});

app.post('/api/membros', async (req,res) => {
  await db.read();
  const { nome,email,rg,status } = req.body;
  if(!nome||!email||!rg) return res.status(400).json({error:'Campos obrigatórios'});
  const novo = {
    id: db.data.membros.length ? Math.max(...db.data.membros.map(m => m.id))+1 : 1,
    nome,email,rg,
    status: status==='inativo'?'inativo':'ativo',
    created_at: new Date().toLocaleString('pt-BR')
  };
  db.data.membros.push(novo);
  await db.write();
  res.status(201).json(novo);
});

app.put('/api/membros/:id', async (req,res) => {
  await db.read();
  const membro = db.data.membros.find(m => m.id === Number(req.params.id));
  if(!membro) return res.status(404).json({error:'Membro não encontrado'});
  const { nome,email,rg,status } = req.body;
  if(nome) membro.nome = nome;
  if(email) membro.email = email;
  if(rg) membro.rg = rg;
  if(status==='ativo'||status==='inativo') membro.status = status;
  membro.created_at = new Date().toLocaleString('pt-BR');
  await db.write();
  res.json(membro);
});

app.delete('/api/membros/:id', async (req,res) => {
  await db.read();
  const index = db.data.membros.findIndex(m => m.id===Number(req.params.id));
  if(index===-1) return res.status(404).json({error:'Membro não encontrado'});
  db.data.membros.splice(index,1);
  await db.write();
  res.json({ok:true});
});

/* ====== STATUS PARA QR CODE (apenas mostra status) ====== */
app.get('/status/:id', async (req,res) => {
  await db.read();
  const membro = db.data.membros.find(m => m.id===Number(req.params.id));
  if(!membro) {
    return res.status(404).send(`
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <div style="font-family:Arial; padding:16px;">
        <h2>Membro não encontrado</h2>
        <p>ID: ${req.params.id}</p>
      </div>
    `);
  }

  const ativo = membro.status === 'ativo';
  const cor = ativo ? '#10B981' : '#EF4444';
  const txt = ativo ? 'ATIVO' : 'INATIVO';

  res.send(`
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <div style="font-family:Arial; padding:24px; max-width:480px; margin:auto; text-align:center;">
      <h2>${membro.nome}</h2>
      <div style="
        padding:16px; 
        border-radius:12px; 
        background:${cor}; 
        color:white; 
        font-size:22px; 
        font-weight:bold;">
        ${txt}
      </div>
      <p style="color:#6B7280; font-size:12px; margin-top:16px;">
        Última atualização: ${membro.created_at}
      </p>
    </div>
  `);
});

// SPA fallback: redireciona para login.html
app.get(/^\/(?!api\/|status\/).*/, (req,res) => {
  res.sendFile(path.join(frontendDir,'login.html'));
});

app.listen(PORT, ()=>console.log(`Servidor rodando em http://localhost:${PORT}`));
