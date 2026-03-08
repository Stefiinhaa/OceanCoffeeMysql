import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.1/+esm";

// --- CONFIGURAÇÃO DO SUPABASE ---
const supabaseUrl = "https://uldxazlnnpuoxfzsovmu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZHhhemxubnB1b3hmenNvdm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3Mjg2NzgsImV4cCI6MjA2NDMwNDY3OH0.fyToys8_muc1XyUebJ19gxGEkCVM_cXg80UJR894xQY";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO DOM ---
    const productGrid = document.getElementById('productGrid');
    const categoryFiltersContainer = document.getElementById('categoryFilters');
    const searchInput = document.getElementById('searchInput');

    let allProducts = []; // Array para guardar todos os produtos carregados

    // --- FUNÇÃO PARA IDENTIFICAR CATEGORIA A PARTIR DO TÍTULO ---
    const getCategoryFromTitle = (title) => {
        const lowerCaseTitle = title.toLowerCase();
        if (lowerCaseTitle.includes('trator')) return 'Tratores';
        if (lowerCaseTitle.includes('colheitadeira')) return 'Colheitadeiras';
        if (lowerCaseTitle.includes('pulverizador')) return 'Pulverizadores';
        if (lowerCaseTitle.includes('implemento') || lowerCaseTitle.includes('rolo faca')) return 'Implementos';
        return 'Outros';
    };

    // ***** NOVA FUNÇÃO ADICIONADA *****
    // Esta função remove acentos e transforma em minúsculas
    const normalizeText = (text) => {
        if (typeof text !== 'string') return '';
        return text
            .toLowerCase()
            .normalize("NFD") // Separa acentos dos caracteres (ex: 'á' vira 'a' + '´')
            .replace(/[\u0300-\u036f]/g, ""); // Remove os acentos (diacríticos)
    };
    // ***** FIM DA NOVA FUNÇÃO *****

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const createProductCard = (product) => {
        const card = document.createElement('div');
        card.className = 'oc-product-card';
        const imageUrl = product.imagens && product.imagens.length > 0 ? product.imagens[0] : 'IMG/placeholder.png';
        const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco);

        card.innerHTML = `
            <a href="MarketPlace.html?id=${product.id}" class="oc-product-card__image-container" aria-label="Ver detalhes de ${product.produto}">
                <img class="oc-product-card__image" src="${imageUrl}" alt="${product.produto}" loading="lazy" decoding="async">
            </a>
            <div class="oc-product-card__content">
                <h3 class="oc-product-card__title">
                    <a href="MarketPlace.html?id=${product.id}" style="text-decoration: none; color: inherit;">${product.produto}</a>
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

    // --- LÓGICA DE FILTRAGEM E BUSCA ---
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
        
        // ***** MUDANÇA APLICADA AQUI *****
        // Usa a nova função normalizeText para o termo de busca
        const searchTerm = normalizeText(searchInput.value);

        let filteredProducts = allProducts;

        if (selectedCategory !== 'Todos') {
            filteredProducts = filteredProducts.filter(product => getCategoryFromTitle(product.produto) === selectedCategory);
        }

        if (searchTerm) {
            // ***** MUDANÇA APLICADA AQUI *****
            // Usa a nova função normalizeText para o título do produto
            filteredProducts = filteredProducts.filter(product =>
                normalizeText(product.produto).includes(searchTerm)
            );
        }
        
        renderProducts(filteredProducts);
    };
    
    // --- INICIALIZAÇÃO E CARREGAMENTO DE DADOS ---
    async function init() {
        if (!productGrid || !categoryFiltersContainer) {
            console.error('Elementos essenciais (grid ou filtros) não encontrados.');
            return;
        }

        const { data, error } = await supabase
            .from('aprovados')
            .select('*')
            .order('data_aprovacao', { ascending: false });

        if (error) {
            console.error("Erro ao buscar produtos:", error);
            productGrid.innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>';
            return;
        }

        allProducts = data;
        renderFilterButtons();
        renderProducts(allProducts); 
        
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