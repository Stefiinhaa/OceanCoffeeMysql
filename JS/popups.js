// Garante que o container para os pop-ups exista na página
function ensurePopupContainer() {
    let container = document.getElementById('popup-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'popup-container';
        container.className = 'popup-container';
        document.body.appendChild(container);
    }
    return container;
}

// Função para mostrar notificações (no canto da tela)
export function showPopup(message, type = 'info', duration = 3500) {
    const container = ensurePopupContainer();
    const popup = document.createElement('div');
    popup.className = `popup ${type}`;
    let iconClass = 'fas fa-info-circle';
    if (type === 'success') iconClass = 'fas fa-check-circle';
    if (type === 'error') iconClass = 'fas fa-times-circle';
    popup.innerHTML = `<i class="${iconClass}"></i> <div>${message}</div>`;
    container.prepend(popup);
    requestAnimationFrame(() => popup.classList.add('show'));
    setTimeout(() => {
        popup.classList.remove('show');
        popup.addEventListener('transitionend', () => popup.remove());
    }, duration);
}

// Função para mostrar pop-up de confirmação (centralizado)
export function showConfirmationPopup(title, message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        overlay.innerHTML = `
            <div class="confirmation-modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="confirmation-actions">
                    <button class="confirmation-btn-cancel">Cancelar</button>
                    <button class="confirmation-btn-confirm">Sim, Sair</button>
                </div>
            </div>
        `;
        const btnCancel = overlay.querySelector('.confirmation-btn-cancel');
        const btnConfirm = overlay.querySelector('.confirmation-btn-confirm');
        const closeModal = (result) => {
            overlay.classList.remove('show');
            overlay.addEventListener('transitionend', () => {
                overlay.remove();
                resolve(result);
            });
        };
        btnCancel.addEventListener('click', () => closeModal(false));
        btnConfirm.addEventListener('click', () => closeModal(true));
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('show'));
    });
}