let dadosGlobais = null;
let abaAtual = 'novos';
let busca = '';

async function carregarApp() {
    const container = document.getElementById('lista-produtos');
    container.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';

    try {
        const res = await fetch('dados.json');
        if (!res.ok) throw new Error();
        dadosGlobais = await res.json();
        
        document.getElementById('inputPesquisa').addEventListener('input', (e) => {
            busca = e.target.value.toLowerCase();
            render();
        });

        setTimeout(render, 400); // Delay suave para o skeleton
    } catch (err) {
        container.innerHTML = `<p style="text-align:center; color:#94a3b8; padding:20px;">Estoque indisponível no momento.</p>`;
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

    const produtos = dadosGlobais[abaAtual];
    const { telefone, mensagem_base } = dadosGlobais.config;
    container.innerHTML = '';

    const filtrados = produtos.filter(p => 
        p.modelo.toLowerCase().includes(busca) || p.capacidade.toLowerCase().includes(busca)
    );

    if (filtrados.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.3; padding:40px; font-size:0.9rem;">Nenhum iPhone encontrado.</p>';
        return;
    }

    filtrados.forEach(item => {
        const info = abaAtual === 'seminovos' ? `Saúde: ${item.saude}` : 'Novo Lacrado';
        const linkWhats = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem_base + " " + item.modelo + " " + item.capacidade)}`;

        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${item.id}`;
        card.innerHTML = `
            <div class="card-header" onclick="toggle(${item.id})">
                <div>
                    <div class="model-name">${item.modelo}</div>
                    <div class="model-info">${item.capacidade} • ${info}</div>
                </div>
                <div style="display:flex; align-items:center;">
                    <div class="price">R$ ${item.preco}</div>
                    <div class="arrow" id="arrow-${item.id}"></div>
                </div>
            </div>
            <div class="content" id="content-${item.id}">
                <div class="desc-text">${item.descricao}</div>
                <a href="${linkWhats}" target="_blank" class="btn-whats">Chamar no WhatsApp</a>
            </div>
        `;
        container.appendChild(card);
    });
}

function toggle(id) {
    const content = document.getElementById(`content-${id}`);
    const arrow = document.getElementById(`arrow-${id}`);
    const card = document.getElementById(`card-${id}`);
    const aberto = content.classList.contains('open');

    document.querySelectorAll('.content').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.arrow').forEach(el => el.classList.remove('up'));

    if (!aberto) {
        content.classList.add('open');
        arrow.classList.add('up');
        // Scroll suave para o item aberto
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }
}

window.addEventListener('DOMContentLoaded', carregarApp);