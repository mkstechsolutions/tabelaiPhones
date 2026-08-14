const URL_API = "https://script.google.com/macros/s/AKfycbz8nFm1oqgzqwWI-TmdZmV1b1Gaw3Ekotxaygk6EmT8hI0c340MWYOvrhLJzsjSNnSo/exec"; 
let dadosGlobais = [];
let abaAtual = 'novos';
let busca = '';
let modoEdicao = false;
let linhaSendoEditada = null; 

const CONFIG = {
    telefone: "5551989426091",
    mensagem_base: "Olá! Tenho interesse no"
};

async function carregarApp() {
    const container = document.getElementById('lista-produtos');
    container.innerHTML = `<p style="text-align:center; color:#94a3b8; padding: 20px;">Conectando...</p>`;
    try {
        const res = await fetch(URL_API);
        dadosGlobais = await res.json();
        render();
        document.getElementById('inputPesquisa').addEventListener('input', (e) => {
            busca = e.target.value.toLowerCase();
            render();
        });
    } catch (err) {
        container.innerHTML = `<p style="text-align:center; color:#ef4444;">Erro ao carregar dados.</p>`;
    }
}

function mudarAba(aba) {
    abaAtual = aba;
    document.getElementById('btn-novos').classList.toggle('active', aba === 'novos');
    document.getElementById('btn-seminovos').classList.toggle('active', aba === 'seminovos');
    render();
}

function render() {
    const container = document.getElementById('lista-produtos');
    if (!container || !dadosGlobais) return;
    container.innerHTML = '';

    const filtrados = dadosGlobais.filter(item => {
        const tipo = (item.tipo || "").toString().trim().toLowerCase();
        const modelo = (item.modelo || "").toString().toLowerCase();
        return tipo === abaAtual && modelo.includes(busca);
    });

    filtrados.forEach((item, index) => {
        const isSeminovo = abaAtual === 'seminovos';
        const labelTipo = isSeminovo ? "Seminovo" : "Novo Lacrado";
        const statusBateria = isSeminovo ? ` | Saúde: ${item.saude}` : "";
        const textoWhats = `${CONFIG.mensagem_base} ${item.modelo} ${item.capacidade} (${labelTipo}${statusBateria}). Valor: R$ ${item.preco}`;
        const linkWhats = `https://wa.me/${CONFIG.telefone}?text=${encodeURIComponent(textoWhats)}`;

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header" onclick="toggle(${index})">
                <div class="model-content-wrapper">
                    <div class="model-name">${item.modelo}</div>
                    <div class="model-info">${item.capacidade} • ${isSeminovo ? item.saude :  'Novo'}🔋</div>
                </div>
                <div class="price-wrapper">
                    <div class="price">R$ ${item.preco}</div>
                    <div class="price-label">À VISTA</div>
                </div>
                <div class="arrow" id="arrow-${index}"></div>
            </div>
            <div class="content" id="content-${index}">
                <div class="desc-text">${item.desc || item.descricao || 'Sem descrição.'}</div>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
                    <a href="${linkWhats}" target="_blank" class="btn-whats">Chamar no WhatsApp</a>
                    
                    ${modoEdicao ? `
                        <div style="display:flex; gap:10px;">
                            <button onclick='prepararEdicao(${JSON.stringify(item)})' style="flex:1; background:#7c3aed" class="btn-whats">Editar</button>
                            <button onclick="excluirProduto(${item.linha_id})" style="flex:1; background:#ef4444" class="btn-whats">Excluir</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    if(modoEdicao && !document.getElementById('btn-novo-produto')){
        const btnNovo = document.createElement('button');
        btnNovo.id = 'btn-novo-produto';
        btnNovo.innerText = "+ Adicionar Novo Produto";
        btnNovo.className = 'btn-whats';
        btnNovo.style.marginBottom = '20px';
        btnNovo.style.background = '#4c1d95';
        btnNovo.onclick = () => {
            linhaSendoEditada = null;
            document.getElementById('add-modelo').value = '';
            document.getElementById('add-capacidade').value = '';
            document.getElementById('add-saude').value = '';
            document.getElementById('add-preco').value = '';
            document.getElementById('add-desc').value = '';
            document.getElementById('add-tipo').value = 'novos';
            
            document.getElementById('modal-adm').style.display = 'block';
            document.querySelector('#modal-adm h3').innerText = "Cadastrar Novo Produto";
        };
        container.prepend(btnNovo);
    }
}

function toggle(id) {
    const content = document.getElementById(`content-${id}`);
    const arrow = document.getElementById(`arrow-${id}`);
    const aberto = content.classList.contains('open');
    document.querySelectorAll('.content').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.arrow').forEach(el => el.classList.remove('up'));
    if (!aberto) {
        content.classList.add('open');
        if(arrow) arrow.classList.add('up');
    }
}

function abrirLoginAdm() {
    const senha = prompt("Senha ADM:");
    if(senha === "mks2026") {
        modoEdicao = true;
        render();
        alert("Modo ADM: Clique em um aparelho para Editar ou Excluir.");
    }
}

function fecharAdm() { 
    document.getElementById('modal-adm').style.display = 'none';
    linhaSendoEditada = null;
}

function prepararEdicao(item) {
    linhaSendoEditada = item.linha_id;
    document.getElementById('add-modelo').value = item.modelo || '';
    document.getElementById('add-capacidade').value = item.capacidade || '';
    document.getElementById('add-saude').value = item.saude || '';
    document.getElementById('add-preco').value = item.preco || '';
    document.getElementById('add-desc').value = item.desc || item.descricao || '';
    document.getElementById('add-tipo').value = item.tipo || 'novos';
    
    document.getElementById('modal-adm').style.display = 'block';
    document.querySelector('#modal-adm h3').innerText = "Editando: " + item.modelo;
}

async function salvarProduto() {
    const btn = document.getElementById('btn-salvar');
    const p = {
        senha: "mks2026", 
        acao: "salvar", 
        linha_id: linhaSendoEditada,
        modelo: document.getElementById('add-modelo').value,
        capacidade: document.getElementById('add-capacidade').value,
        saude: document.getElementById('add-saude').value,
        preco: document.getElementById('add-preco').value,
        descricao: document.getElementById('add-desc').value,
        tipo: document.getElementById('add-tipo').value
    };

    btn.innerText = "Sincronizando...";
    btn.disabled = true;

    try {
        await fetch(URL_API, { method: 'POST', mode: 'no-cors', body: JSON.stringify(p) });
        alert(linhaSendoEditada ? "Produto Atualizado!" : "Produto Adicionado!");
        location.reload();
    } catch (e) {
        alert("Erro ao salvar.");
        btn.innerText = "Salvar na Planilha";
        btn.disabled = false;
    }
}

async function excluirProduto(linha) {
    if(!confirm("Tem certeza que deseja apagar este item?")) return;
    await fetch(URL_API, {
        method: 'POST', mode: 'no-cors',
        body: JSON.stringify({ senha: "mks2026", acao: "excluir", linha: linha })
    });
    location.reload();
}

carregarApp();
