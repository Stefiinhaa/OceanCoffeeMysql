document.addEventListener('DOMContentLoaded', () => {
    const gridSolicitacoes = document.getElementById('grid-solicitacoes'); 

    async function carregarSolicitacoes() {
        try {
            const response = await fetch('buscar_pendentes.php');
            const data = await response.json();

            if (data.status === true) {
                renderizarSolicitacoes(data.produtos);
            } else {
                if(gridSolicitacoes) {
                    gridSolicitacoes.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Nenhuma solicitacao pendente encontrada.</p>';
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    function renderizarSolicitacoes(produtos) {
        if (!gridSolicitacoes) return;
        
        gridSolicitacoes.innerHTML = '';

        if (produtos.length === 0) {
            gridSolicitacoes.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Nenhuma solicitacao pendente encontrada.</p>';
            return;
        }

        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'oc-product-card';

            const imageUrl = produto.imagem_0 ? produto.imagem_0 : 'IMG/placeholder.png';
            const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco);

            card.innerHTML = `
                <div class="oc-product-card__image-container">
                    <img class="oc-product-card__image" src="${imageUrl}" alt="${produto.titulo}">
                </div>
                <div class="oc-product-card__content">
                    <h3 class="oc-product-card__title">${produto.titulo}</h3>
                    <p class="oc-product-card__description">${produto.descricao.substring(0, 100)}...</p>
                    <span class="oc-product-card__price">${priceFormatted}</span>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn-aprovar" data-id="${produto.id}" style="background-color: green; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 5px; width: 100%;">Aprovar</button>
                        <button class="btn-rejeitar" data-id="${produto.id}" style="background-color: red; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 5px; width: 100%;">Rejeitar</button>
                    </div>
                </div>`;
            
            gridSolicitacoes.appendChild(card);
        });

        document.querySelectorAll('.btn-aprovar').forEach(btn => {
            btn.addEventListener('click', (e) => atualizarStatus(e.target.dataset.id, 'aprovado'));
        });

        document.querySelectorAll('.btn-rejeitar').forEach(btn => {
            btn.addEventListener('click', (e) => atualizarStatus(e.target.dataset.id, 'rejeitado'));
        });
    }

    async function atualizarStatus(id, novoStatus) {
        const confirmacao = confirm(`Tem a certeza que deseja atualizar este anuncio para ${novoStatus}?`);
        if (!confirmacao) return;

        try {
            const response = await fetch('atualizar_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, status: novoStatus })
            });

            const data = await response.json();

            if (data.status === true) {
                alert('Anuncio atualizado com sucesso!');
                carregarSolicitacoes(); 
            } else {
                alert('Erro ao atualizar o anuncio.');
            }
        } catch (error) {
            console.error(error);
        }
    }

    carregarSolicitacoes();
});