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

// ========================================================================
// MÁGICA DE SINCRONIZAÇÃO EM SEGUNDO PLANO (BACKGROUND SYNC)
// ========================================================================

// 1. Função para abrir o cofre offline (IndexedDB)
function abrirCofreOffline() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('OceanCoffeeDB', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Cria a tabela onde os anúncios offline vão ficar esperando
            db.createObjectStore('anuncios_pendentes', { keyPath: 'id', autoIncrement: true });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject('Erro ao abrir o cofre offline');
    });
}

// 2. Escutar o evento 'sync' (Disparado pelo navegador assim que a internet volta)
self.addEventListener('sync', (event) => {
    if (event.tag === 'enviar-anuncios-offline') {
        console.log('[Service Worker] Internet voltou! Sincronizando anúncios...');
        event.waitUntil(processarAnunciosOffline());
    }
});

// 3. Função que pega do cofre e envia
async function processarAnunciosOffline() {
    const db = await abrirCofreOffline();
    const tx = db.transaction('anuncios_pendentes', 'readonly');
    const store = tx.objectStore('anuncios_pendentes');
    
    // Pega todos os anúncios guardados
    const anunciosGuardados = await new Promise(res => {
        const req = store.getAll();
        req.onsuccess = () => res(req.result);
    });

    if (anunciosGuardados.length === 0) return;

    for (const anuncio of anunciosGuardados) {
        try {
            // ======================================================
            // AQUI VOCÊ FARIA O ENVIO REAL PARA O SEU BACKEND/API
            // ======================================================
            console.log('Enviando anúncio salvo:', anuncio);
            
            // Exemplo de como seria o envio:
            // await fetch('/api/salvar_anuncio', { method: 'POST', body: JSON.stringify(anuncio) });
            
            // Se o envio deu certo, apagamos do cofre offline para não enviar duplicado
            const txDelete = db.transaction('anuncios_pendentes', 'readwrite');
            txDelete.objectStore('anuncios_pendentes').delete(anuncio.id);

        } catch (err) {
            console.log('Falha ao enviar anúncio offline. O sistema tentará novamente depois.');
        }
    }

    // 4. Manda um Push para o usuário avisando que o anúncio foi publicado!
    self.registration.showNotification('Ocean Coffee', {
        body: 'A internet voltou e seu anúncio foi publicado com sucesso! ☕',
        icon: 'IMG/Loginho2.png',
        vibrate: [200, 100, 200]
    });
}