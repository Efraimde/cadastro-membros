const $ = (sel) => document.querySelector(sel);
const tbody = $('#corpo-tabela');

async function carregar() {
  const res = await fetch('/api/membros');
  const dados = await res.json();
  renderTabela(dados);
}

function renderTabela(lista) {
  tbody.innerHTML = '';
  for (const m of lista) {
    const tr = document.createElement('tr');

    const tdId = `<td>${m.id}</td>`;
    const tdNome = `<td>${m.nome}</td>`;
    const tdEmail = `<td>${m.email}</td>`;
    const tdRg = `<td>${m.rg}</td>`;
    const tdStatus = `<td><span class="badge ${m.status}">${m.status.toUpperCase()}</span></td>`;

    const tdAcoes = document.createElement('td');
    tdAcoes.className = 'actions';
    tdAcoes.innerHTML = `
      <button class="btn small" data-acao="toggle" data-id="${m.id}">${m.status === 'ativo' ? 'Desativar' : 'Ativar'}</button>
      <a class="btn small ghost" href="./carteirinhas.html?id=${m.id}">Carteirinha</a>
      <button class="btn small ghost" data-acao="editar" data-id="${m.id}">Editar</button>
      <button class="btn small ghost" data-acao="excluir" data-id="${m.id}">Excluir</button>
    `;

    tr.innerHTML = tdId + tdNome + tdEmail + tdRg + tdStatus;
    tr.appendChild(tdAcoes);
    tbody.appendChild(tr);
  }
}

$('#form-membro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    nome: $('#nome').value.trim(),
    email: $('#email').value.trim(),
    rg: $('#rg').value.trim(),
    status: $('#status').value
  };
  const res = await fetch('/api/membros', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) { alert('Erro ao cadastrar'); return; }
  e.target.reset();
  carregar();
});

tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const acao = btn.dataset.acao;
  const id = btn.dataset.id;

  if (acao === 'toggle') {
    const r = await fetch(`/api/membros/${id}`);
    const m = await r.json();
    const novoStatus = m.status === 'ativo' ? 'inativo' : 'ativo';
    await fetch(`/api/membros/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ status: novoStatus })
    });
    carregar();
  }

  if (acao === 'editar') {
    const r = await fetch(`/api/membros/${id}`);
    const m = await r.json();
    const nome = prompt('Nome:', m.nome);
    if (nome === null) return;
    const email = prompt('E-mail:', m.email);
    if (email === null) return;
    const rg = prompt('RG:', m.rg);
    if (rg === null) return;

    await fetch(`/api/membros/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ nome, email, rg })
    });
    carregar();
  }

  if (acao === 'excluir') {
    if (!confirm('Tem certeza que deseja excluir este membro?')) return;
    await fetch(`/api/membros/${id}`, { method: 'DELETE' });
    carregar();
  }
});

carregar();

