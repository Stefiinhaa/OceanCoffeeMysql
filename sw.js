// sw.js - Motor de Notificações da Ocean Coffee

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força a instalação imediata
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim()); // Assume o controle da página na hora
});

// ------------------------------------------------------------------------
// REQUISITO OBRIGATÓRIO DO GOOGLE PARA O CELULAR DEIXAR "BAIXAR O APP" (PWA)
self.addEventListener('fetch', function(event) {
    // Não altera nada visualmente, apenas deixa o site carregar normalmente
    event.respondWith(fetch(event.request));
});
// ------------------------------------------------------------------------

// ESCUTAR O PUSH 
self.addEventListener('push', function(event) {
    let titulo = 'Ocean Coffee';
    let msg = 'Tem uma nova notificação!';

    // Tratamento à prova de falhas
    if (event.data) {
        try {
            const data = event.data.json();
            titulo = data.title || titulo;
            msg = data.body || data.message || msg;
        } catch (e) {
            msg = event.data.text() || msg;
        }
    }

    const options = {
        body: msg,
        icon: 'IMG/Loginho2.png',
        badge: 'IMG/Loginho2.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/' 
        }
    };

    event.waitUntil(
        self.registration.showNotification(titulo, options)
    );
});

// Ação ao clicar na notificação
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});