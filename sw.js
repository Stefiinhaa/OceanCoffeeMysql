// sw.js - Motor de Notificações e Modo Offline da Ocean Coffee

const CACHE_NAME = 'ocean-coffee-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força a instalação imediata
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        // Limpa caches antigos caso a versão mude
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => clients.claim())
    );
});

// ========================================================================
// MÁGICA DO MODO OFFLINE (CACHE DINÂMICO)
// ========================================================================
self.addEventListener('fetch', function(event) {
    // Só interceptamos requisições normais de páginas (GET). Ignoramos POST do Supabase, etc.
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

    event.respondWith(
        // 1º TENTA A REDE (Para ter sempre a versão mais atualizada)
        fetch(event.request)
            .then(function(response) {
                // Se a internet funcionou, salva uma cópia da página no Cache para quando faltar internet!
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(function() {
                // 2º DEU ERRO (SEM INTERNET)? PEGA A CÓPIA SALVA NO CACHE!
                return caches.match(event.request);
            })
    );
});


// ========================================================================
// SISTEMA DE NOTIFICAÇÕES PUSH (Mantido intacto)
// ========================================================================
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