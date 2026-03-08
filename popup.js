// Função para pop-ups INTERATIVOS (erros, confirmações)
export function showPopup(message, type = 'error') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        
        let iconClass = '';
        let buttonsHtml = '';

        switch(type) {
            case 'error':
                iconClass = 'fas fa-times-circle error';
                buttonsHtml = `<button class="btn-ok">OK</button>`;
                break;
            case 'confirm':
                iconClass = 'fas fa-exclamation-triangle confirm';
                buttonsHtml = `<button class="btn-cancel">Cancelar</button><button class="btn-confirm">Sim</button>`;
                break;
            case 'success':
            default:
                iconClass = 'fas fa-check-circle success';
                buttonsHtml = `<button class="btn-ok">OK</button>`;
                break;
        }

        overlay.innerHTML = `
            <div class="popup-content">
                <i class="popup-icon ${iconClass}"></i>
                <h3>${message}</h3>
                <div class="popup-buttons">
                    ${buttonsHtml}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('visible'), 10);

        const closePopup = (value) => {
            overlay.classList.remove('visible');
            overlay.addEventListener('transitionend', () => {
                overlay.remove();
                resolve(value);
            });
        };

        overlay.querySelector('.btn-ok')?.addEventListener('click', () => closePopup(true));
        overlay.querySelector('.btn-confirm')?.addEventListener('click', () => closePopup(true));
        overlay.querySelector('.btn-cancel')?.addEventListener('click', () => closePopup(false));
    });
}

// Função para pop-ups AUTOMÁTICOS (sucesso)
export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-times-circle';
    toast.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
    
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 2500); // A notificação some após 2.5 segundos
}