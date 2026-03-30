document.addEventListener('DOMContentLoaded', () => {

    const productGrid = document.getElementById('productGrid');
    const categoryFiltersContainer = document.getElementById('categoryFilters');
    const searchInput = document.getElementById('searchInput');

    let allProducts = []; 

    const getCategoryFromTitle = (title) => {
        const lowerCaseTitle = title.toLowerCase();
        if (lowerCaseTitle.includes('trator')) return 'Tratores';
        if (lowerCaseTitle.includes('colheitadeira')) return 'Colheitadeiras';
        if (lowerCaseTitle.includes('pulverizador')) return 'Pulverizadores';
        if (lowerCaseTitle.includes('implemento') || lowerCaseTitle.includes('rolo faca')) return 'Implementos';
        return 'Outros';
    };

    const normalizeText = (text) => {
        if (typeof text !== 'string') return '';
        return text
            .toLowerCase()
            .normalize("NFD") 
            .replace(/[\u0300-\u036f]/g, ""); 
    };

    const createProductCard = (product) => {
        const card = document.createElement('div');
        card.className = 'oc-product-card';
        
        const imageUrl = product.imagem_0 ? product.imagem_0 : 'IMG/placeholder.png';
        const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco);

        // Lógica da Faixa de Vendido
        const faixaVendido = product.vendido == 1 ? '<div class="faixa-vendido">VENDIDO</div>' : '';

        card.innerHTML = `
            <a href="MarketPlace.html?id=${product.id}" class="oc-product-card__image-container" aria-label="Ver detalhes de ${product.titulo}" style="position: relative; overflow: hidden; display: block;">
                ${faixaVendido}
                <img class="oc-product-card__image" src="${imageUrl}" alt="${product.titulo}" loading="lazy" decoding="async">
            </a>
            <div class="oc-product-card__content">
                <h3 class="oc-product-card__title">
                    <a href="MarketPlace.html?id=${product.id}" style="text-decoration: none; color: inherit;">${product.titulo}</a>
                </h3>
                <p class="oc-product-card__description">${product.descricao.substring(0, 100)}...</p>
                <div class="oc-product-card__footer">
                    <span class="oc-product-card__price">${priceFormatted}</span>
                    <a href="MarketPlace.html?id=${product.id}" class="oc-product-card__button">Ver Mais</a>
                </div>
            </div>`;
        return card;
    };

    const renderProducts = (products) => {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        if (products.length === 0) {
            productGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Nenhum produto encontrado.</p>';
            return;
        }
        products.forEach((product, index) => {
            const card = createProductCard(product);
            card.style.animationDelay = `${index * 80}ms`;
            productGrid.appendChild(card);
        });
    };

    const renderFilterButtons = () => {
        if (!categoryFiltersContainer) return;
        categoryFiltersContainer.innerHTML = '';

        const categories = ['Todos', 'Tratores', 'Colheitadeiras', 'Pulverizadores', 'Implementos', 'Outros'];

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'oc-filter-button';
            button.textContent = category;
            button.dataset.category = category;
            if (category === 'Todos') {
                button.classList.add('active');
            }
            categoryFiltersContainer.appendChild(button);
        });
    };

    const filterAndRender = () => {
        const selectedCategory = document.querySelector('.oc-filter-button.active')?.dataset.category || 'Todos';
        const searchTerm = normalizeText(searchInput.value);

        let filteredProducts = allProducts;

        if (selectedCategory !== 'Todos') {
            filteredProducts = filteredProducts.filter(product => getCategoryFromTitle(product.titulo) === selectedCategory);
        }

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                normalizeText(product.titulo).includes(searchTerm)
            );
        }
        
        renderProducts(filteredProducts);
    };
    
    async function init() {
        if (!productGrid || !categoryFiltersContainer) {
            console.error('Elementos essenciais não encontrados.');
            return;
        }

        try {
            // Este PHP já puxa os mais recentes primeiro por conta do "ORDER BY id DESC"
         // No JS/loja.js, dentro da função init(), altere para:
            const response = await fetch('listar_anuncios.php?t=' + Date.now());
            const data = await response.json();

            if (data.status === true) {
                allProducts = data.produtos;
                renderFilterButtons();
                renderProducts(allProducts); 
            } else {
                productGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Não foi possível carregar os produtos no momento.</p>';
            }
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            productGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Ocorreu uma falha de comunicação com o servidor.</p>';
        }
        
        categoryFiltersContainer.addEventListener('click', (event) => {
            const clickedButton = event.target.closest('.oc-filter-button');
            if (!clickedButton) return;
            document.querySelectorAll('.oc-filter-button').forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');
            filterAndRender();
        });
        
        searchInput.addEventListener('input', filterAndRender);
    };

    init();
});