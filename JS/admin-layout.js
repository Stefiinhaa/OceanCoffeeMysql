/*
Nome do Arquivo: JS/admin-layout.js
Função: Script centralizado para o layout do painel admin (Sidebar, Breadcrumbs, Logout)
*/
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.1/+esm";

// --- Configuração Supabase (necessário para logout) ---
const supabaseUrl = "https://uldxazlnnpuoxfzsovmu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZHhhemxubnB1b3hmenNvdm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3Mjg2NzgsImV4cCI6MjA2NDMwNDY3OH0.fyToys8_muc1XyUebJ19gxGEkCVM_cXg80UJR894xQY";
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Atualiza e renderiza os breadcrumbs dinamicamente.
 * @param {string} pageName - O nome da página atual (ex: "Usuários").
 * @param {string} pageIcon - A classe do ícone FontAwesome (ex: "fas fa-users").
 */
function updateBreadcrumbs(pageName, pageIcon) {
    const breadcrumbContainer = document.querySelector('nav.breadcrumb');
    if (!breadcrumbContainer) {
        console.warn("Elemento <nav class='breadcrumb'> não encontrado.");
        return;
    }

    const currentPage = {
        name: pageName,
        href: window.location.pathname.split('/').pop(), // Pega o nome do arquivo, ex: "admin.html"
        icon: pageIcon
    };

    let path = [];
    try {
        // Tenta obter o caminho salvo na sessão
        path = JSON.parse(sessionStorage.getItem('adminBreadcrumbPath')) || [];
    } catch (e) {
        path = []; // Reseta em caso de JSON inválido
    }

    // Caso especial: Dashboard SEMPRE reseta o caminho
    if (pageName === "Dashboard") {
        path = [currentPage];
    } else {
        // Verifica se a página atual já está no caminho (ex: F5, ou clique duplicado)
        const existingPageIndex = path.findIndex(p => p.name === pageName);
        
        if (existingPageIndex > -1) {
            // Se sim, corta o caminho até esse ponto (evita duplicatas ao recarregar)
            path = path.slice(0, existingPageIndex + 1);
        } else {
            // Se não, adiciona a nova página ao caminho
            // Se o caminho estiver vazio ou não começar com Dashboard, reseta
            if (path.length === 0 || path[0].name !== "Dashboard") {
                path = [
                    { name: "Dashboard", href: "dashboard.html", icon: "fas fa-tachometer-alt" },
                    currentPage
                ];
            } else {
                // Adiciona a página atual ao caminho existente
                path.push(currentPage);
            }
        }
    }

    // Salva o novo caminho na sessão
    sessionStorage.setItem('adminBreadcrumbPath', JSON.stringify(path));

    // Renderiza o HTML do breadcrumb
    breadcrumbContainer.innerHTML = ''; // Limpa o conteúdo estático
    path.forEach((page, index) => {
        if (index < path.length - 1) {
            // É um link clicável (não é a última página)
            breadcrumbContainer.innerHTML += `
                <a href="${page.href}" onclick="handleBreadcrumbClick(event, ${index})"><i class="${page.icon}"></i> ${page.name}</a>
                <i class="fas fa-chevron-right"></i>
            `;
        } else {
            // É a página atual (apenas texto)
            breadcrumbContainer.innerHTML += `
                <span><i class="${page.icon}"></i> ${page.name}</span>
            `;
        }
    });
}

/**
 * Lida com cliques nos links do breadcrumb para ajustar o histórico.
 * @param {Event} event - O evento de clique.
 * @param {number} index - O índice do link clicado no caminho.
 */
window.handleBreadcrumbClick = (event, index) => {
    // Não precisa prevenir o default, o link deve navegar
    try {
        let path = JSON.parse(sessionStorage.getItem('adminBreadcrumbPath')) || [];
        // Corta o caminho para que ele termine no item clicado
        path = path.slice(0, index + 1); 
        sessionStorage.setItem('adminBreadcrumbPath', JSON.stringify(path));
    } catch (e) {
        console.error("Erro ao redefinir breadcrumb via clique:", e);
    }
    // Deixa a navegação padrão (href) acontecer
};


/**
 * Inicializa a lógica da sidebar (toggle desktop e mobile).
 */
function initSidebarLogic() {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle"); // Botão Desktop
    const mainContent = document.getElementById("mainContent");
    const mainHeader = document.getElementById("mainHeader");
    const menuToggleMobile = document.getElementById('menu-toggle-mobile'); // Botão Mobile
    const navOverlay = document.getElementById('nav-overlay');

    if (!sidebar || !sidebarToggle || !mainContent || !mainHeader || !menuToggleMobile || !navOverlay) {
        console.warn("Elementos do layout (sidebar, header) não encontrados.");
        return;
    }

    const applyDesktopCollapsedState = () => {
        if (window.innerWidth <= 992) return;
        const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
        sidebar.classList.toggle("collapsed", isCollapsed);
        mainContent.classList.toggle("shifted", isCollapsed);
        mainHeader.classList.toggle("shifted", isCollapsed);
    };
    
    applyDesktopCollapsedState(); // Aplica no carregamento

    sidebarToggle.addEventListener("click", () => {
        if (window.innerWidth > 992) {
            sidebar.classList.toggle("collapsed");
            mainContent.classList.toggle("shifted");
            mainHeader.classList.toggle("shifted");
            localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));
        }
    });

    const closeMobileMenu = () => {
        sidebar.classList.remove('is-open');
        navOverlay.classList.remove('is-open');
    };

    menuToggleMobile.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.add('is-open');
        navOverlay.classList.add('is-open');
    });

    navOverlay.addEventListener('click', closeMobileMenu);

    // Fecha o menu mobile ao clicar em um item
    sidebar.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                closeMobileMenu();
            }
        });
    });
    
    // O botão de logout é tratado separadamente
    sidebar.querySelector('.menu-item-logout').addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
             // Apenas fecha o menu, o initLogoutButton cuida da lógica de sair
             closeMobileMenu();
        }
    });


    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            closeMobileMenu();
            applyDesktopCollapsedState();
        } else {
            sidebar.classList.remove("collapsed");
            mainContent.classList.remove("shifted");
            mainHeader.classList.remove("shifted");
        }
    });
}

/**
 * Inicializa o botão de logout.
 */
function initLogoutButton() {
    const logoutButton = document.querySelector(".menu-item-logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", async (e) => {
            e.preventDefault();
            // Opcional: Adicionar pop-up de confirmação aqui
            await supabase.auth.signOut();
            sessionStorage.removeItem('adminBreadcrumbPath'); // Limpa o histórico
            window.location.replace("index.html");
        });
    }
}

// --- Exporta a função principal de inicialização ---
// A função `initAdminPage` será chamada por cada página do admin.
export function initAdminPage(pageInfo) {
    document.addEventListener('DOMContentLoaded', () => {
        // Inicializa todos os componentes do layout
        initSidebarLogic();
        initLogoutButton();
        
        // Inicializa os breadcrumbs para a página atual
        if (pageInfo && pageInfo.name && pageInfo.icon) {
            updateBreadcrumbs(pageInfo.name, pageInfo.icon);
        } else {
            console.error("Informações da página (nome, ícone) não fornecidas para initAdminPage.");
        }
    });
}