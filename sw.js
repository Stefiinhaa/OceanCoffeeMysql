// sw.js - Motor de Notificações e Modo Offline da Ocean Coffee

const CACHE_NAME = 'ocean-coffee-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) return caches.delete(cache);
                })
            );
        }).then(() => clients.claim())
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(function() {
                return caches.match(event.request);
            })
    );
});

self.addEventListener('push', function(event) {
    let titulo = 'Ocean Coffee';
    let msg = 'Tem uma nova notificação!';

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
        data: { url: '/' }
    };

    event.waitUntil(self.registration.showNotification(titulo, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});

// ========================================================================
// MÁGICA DE SINCRONIZAÇÃO EM SEGUNDO PLANO (CRIAR E EDITAR)
// ========================================================================

function abrirCofreOffline() {
    return new Promise((resolve, reject) => {
        // VERSÃO 2: Para criar a nova tabela de edições
        const request = indexedDB.open('OceanCoffeeDB', 2); 
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('anuncios_pendentes')) {
                db.createObjectStore('anuncios_pendentes', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('edicoes_pendentes')) {
                db.createObjectStore('edicoes_pendentes', { keyPath: 'id_local', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject('Erro ao abrir o cofre offline');
    });
}

self.addEventListener('sync', (event) => {
    if (event.tag === 'enviar-anuncios-offline') {
        console.log('[Service Worker] Sincronizando novos anúncios...');
        event.waitUntil(processarAnunciosOffline());
    }
    if (event.tag === 'editar-anuncios-offline') {
        console.log('[Service Worker] Sincronizando edições de anúncios...');
        event.waitUntil(processarEdicoesOffline());
    }
});

// 1. Processar Criação (Já existia)
async function processarAnunciosOffline() {
    const db = await abrirCofreOffline();
    const tx = db.transaction('anuncios_pendentes', 'readonly');
    const store = tx.objectStore('anuncios_pendentes');
    
    const anunciosGuardados = await new Promise(res => {
        const req = store.getAll();
        req.onsuccess = () => res(req.result);
    });

    if (anunciosGuardados.length === 0) return;

    for (const anuncio of anunciosGuardados) {
        try {
            const formData = new FormData();
            formData.append('usuario_id', anuncio.usuario_id);
            formData.append('titulo', anuncio.titulo);
            formData.append('descricao', anuncio.descricao);
            formData.append('preco', anuncio.preco);
            formData.append('local', anuncio.local);
            formData.append('contato', anuncio.contato);
            if (anuncio.imagem_0) formData.append('imagem_0', anuncio.imagem_0);
            if (anuncio.imagem_1) formData.append('imagem_1', anuncio.imagem_1);
            if (anuncio.imagem_2) formData.append('imagem_2', anuncio.imagem_2);
            
            const response = await fetch('salvar_anuncio.php', { method: 'POST', body: formData });
            const data = await response.json();
            
            if (data.status === true) {
                const txDelete = db.transaction('anuncios_pendentes', 'readwrite');
                txDelete.objectStore('anuncios_pendentes').delete(anuncio.id);
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETO' }));
                });
            }
        } catch (err) { return; }
    }

    self.registration.showNotification('Ocean Coffee', {
        body: 'A internet voltou e seu anúncio foi publicado! ☕',
        icon: 'IMG/Loginho2.png',
        data: { url: '/meus-anuncios.html' }
    });
}

// 2. Processar Edição (NOVIDADE)
async function processarEdicoesOffline() {
    const db = await abrirCofreOffline();
    const tx = db.transaction('edicoes_pendentes', 'readonly');
    const store = tx.objectStore('edicoes_pendentes');
    
    const edicoesGuardadas = await new Promise(res => {
        const req = store.getAll();
        req.onsuccess = () => res(req.result);
    });

    if (edicoesGuardadas.length === 0) return;

    for (const edicao of edicoesGuardadas) {
        try {
            const formData = new FormData();
            formData.append('id', edicao.anuncio_id); // ID REAL NO MYSQL
            formData.append('titulo', edicao.titulo);
            formData.append('descricao', edicao.descricao);
            formData.append('preco', edicao.preco);
            formData.append('local', edicao.local);
            formData.append('contato', edicao.contato);
            formData.append('imagem_0', edicao.imagem_0);
            formData.append('imagem_1', edicao.imagem_1);
            formData.append('imagem_2', edicao.imagem_2);
            
            const response = await fetch('atualizar_anuncio.php', { method: 'POST', body: formData });
            const data = await response.json();
            
            if (data.status === true) {
                const txDelete = db.transaction('edicoes_pendentes', 'readwrite');
                txDelete.objectStore('edicoes_pendentes').delete(edicao.id_local);
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETO' }));
                });
            }
        } catch (err) { return; }
    }

    self.registration.showNotification('Ocean Coffee', {
        body: 'A internet voltou e as alterações no seu anúncio foram salvas! ✍️',
        icon: 'IMG/Loginho2.png',
        data: { url: '/meus-anuncios.html' }
    });
}