// sw.js - Motor PWA e Notificações da Ocean Coffee
const CACHE_NAME = 'oceancoffee-v2-mysql'; // Mudamos o nome para forçar a atualização nos telemóveis

// Ficheiros estáticos básicos para o PWA funcionar offline (apenas o essencial)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/Login.html',
    '/CSS/estilo.css',
    '/IMG/Loginho2.png',
    '/IMG/Fundo.png'
];

// 1. INSTALAÇÃO DO SERVICE WORKER E CRIAÇÃO DO CACHE
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força a instalação imediata
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Guarda apenas a estrutura básica (não guarda dados do MySQL)
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// 2. ATIVAÇÃO E LIMPEZA DA "SUJIDADE" DO SUPABASE
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    // Se o cache for diferente da versão atual, apaga-o
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Assume o controlo imediato
    );
});

// 3. O INTERCETOR DE PEDIDOS (O SEGREDO PARA O PWA FUNCIONAR COM PHP)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // REGRA DE OURO: Ignorar completamente ficheiros PHP e pedidos POST (envio de dados).
    // Estes têm de ir sempre à internet (ao seu servidor MySQL).
    if (url.pathname.endsWith('.php') || event.request.method !== 'GET') {
        return; // Sai do Service Worker e processa normalmente na internet
    }

    // Para os outros ficheiros (HTML, CSS, Imagens):
    // Estratégia "Network First" (Tenta a internet primeiro, se falhar ou estiver offline, usa o cache)
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

// ------------------------------------------------------------------------
// ESCUTAR O PUSH (NOTIFICAÇÕES)
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