 import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.1/+esm";

const supabaseUrl = "https://uldxazlnnpuoxfzsovmu.supabase.co";
const supabaseKey = "eyJhbGciOiJIuJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZHhhemxubnB1b3hmenNvdm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3Mjg2NzgsImV4cCI6MjA2NDMwNDY3OH0.fyToys8_muc1XyUebJ19gxGEkCVM_cXg80UJR894xQY";
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para buscar e exibir os produtos pendentes
async function fetchPendingProducts() {
    const { data: produtos, error } = await supabase
        .from('produtos')
        .select('*')
        .is('aprovado', null); // Busca onde 'aprovado' é NULO (pendente)

    if (error) {
        console.error('Erro ao buscar produtos pendentes:', error);
        return;
    }

    const container = document.getElementById('solicitacoes-container');
    container.innerHTML = ''; // Limpa o container

    if (produtos.length === 0) {
        container.innerHTML = '<p>Nenhuma solicitação de anúncio pendente no momento.</p>';
        return;
    }

    produtos.forEach(produto => {
        const div = document.createElement('div');
        div.classList.add('solicitacao-item');
        div.setAttribute('data-id', produto.id);
        div.innerHTML = `
            <img src="${produto.imagens[0]}" alt="Imagem do produto" class="produto-imagem">
            <div class="solicitacao-info">
                <h3>${produto.produto}</h3>
                <p><strong>Vendedor:</strong> ${produto.nome_usuario}</p>
                <p><strong>Preço:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}</p>
            </div>
            <div class="solicitacao-actions">
                <button class="approve-btn">Aprovar</button>
                <button class="reject-btn">Rejeitar</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Função para aprovar um produto
async function approveProduct(productId) {
    // AQUI ESTÁ A CORREÇÃO PRINCIPAL
    const { error } = await supabase
        .from('produtos') // Nome correto da tabela: 'produtos'
        .update({ aprovado: true })
        .eq('id', productId);

    if (error) {
        console.error('Erro ao aprovar:', error);
        alert('Erro ao aprovar o anúncio.');
    } else {
        alert('Anúncio aprovado com sucesso!');
        // Remove o item da lista na interface
        document.querySelector(`.solicitacao-item[data-id='${productId}']`).remove();
    }
}

// Função para rejeitar um produto
async function rejectProduct(productId) {
    // AQUI ESTÁ A CORREÇÃO PRINCIPAL
    const { error } = await supabase
        .from('produtos') // Nome correto da tabela: 'produtos'
        .update({ aprovado: false })
        .eq('id', productId);

    if (error) {
        console.error('Erro ao rejeitar:', error);
        alert('Erro ao rejeitar o anúncio.');
    } else {
        alert('Anúncio rejeitado com sucesso!');
        // Remove o item da lista na interface
        document.querySelector(`.solicitacao-item[data-id='${productId}']`).remove();
    }
}


// Adiciona os event listeners para os botões de aprovar/rejeitar
document.addEventListener('click', (event) => {
    const target = event.target;
    const solicitacaoItem = target.closest('.solicitacao-item');
    if (!solicitacaoItem) return;

    const productId = solicitacaoItem.dataset.id;

    if (target.classList.contains('approve-btn')) {
        approveProduct(productId);
    } else if (target.classList.contains('reject-btn')) {
        rejectProduct(productId);
    }
});


// Carrega as solicitações pendentes quando a página é carregada
document.addEventListener('DOMContentLoaded', fetchPendingProducts);