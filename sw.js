// sw.js - Motor de Notificações e Modo Offline da Ocean Coffee

const CACHE_NAME = 'ocean-coffee-cache-v1';

self.addEventListener('install', (event) => { self.skipWaiting(); });

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => { if (cache !== CACHE_NAME) return caches.delete(cache); })
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
                caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, responseClone); });
                return response;
            })
            .catch(function() { return caches.match(event.request); })
    );
});

self.addEventListener('push', function(event) {
    let titulo = 'Ocean Coffee'; let msg = 'Tem uma nova notificação!';
    if (event.data) {
        try {
            const data = event.data.json();
            titulo = data.title || titulo; msg = data.body || data.message || msg;
        } catch (e) { msg = event.data.text() || msg; }
    }
    const options = { body: msg, icon: 'IMG/Loginho2.png', badge: 'IMG/Loginho2.png', vibrate: [200, 100, 200], data: { url: '/' } };
    event.waitUntil(self.registration.showNotification(titulo, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});

// ========================================================================
// MÁGICA DE SINCRONIZAÇÃO EM SEGUNDO PLANO (CRIAR, EDITAR, EXCLUIR E AÇÕES DO ADMIN)
// ========================================================================

function abrirCofreOffline() {
    return new Promise((resolve, reject) => {
        // VERSÃO 4: Adicionada a gaveta de ações do Administrador
        const request = indexedDB.open('OceanCoffeeDB', 4); 
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('anuncios_pendentes')) db.createObjectStore('anuncios_pendentes', { keyPath: 'id', autoIncrement: true });
            if (!db.objectStoreNames.contains('edicoes_pendentes')) db.createObjectStore('edicoes_pendentes', { keyPath: 'id_local', autoIncrement: true });
            if (!db.objectStoreNames.contains('exclusoes_pendentes')) db.createObjectStore('exclusoes_pendentes', { keyPath: 'id_local', autoIncrement: true });
            if (!db.objectStoreNames.contains('admin_acoes_pendentes')) db.createObjectStore('admin_acoes_pendentes', { keyPath: 'id_local', autoIncrement: true });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject('Erro ao abrir o cofre offline');
    });
}

self.addEventListener('sync', (event) => {
    if (event.tag === 'enviar-anuncios-offline') event.waitUntil(processarAnunciosOffline());
    if (event.tag === 'editar-anuncios-offline') event.waitUntil(processarEdicoesOffline());
    if (event.tag === 'excluir-anuncios-offline') event.waitUntil(processarExclusoesOffline());
    if (event.tag === 'admin-acoes-offline') {
        console.log('[Service Worker] Sincronizando ações do admin...');
        event.waitUntil(processarAcoesAdminOffline());
    }
});

// 1. Processar Criação 
async function processarAnunciosOffline() {
    const db = await abrirCofreOffline();
    const tx = db.transaction('anuncios_pendentes', 'readonly');
    const anunciosGuardados = await new Promise(res => { const req = tx.objectStore('anuncios_pendentes').getAll(); req.onsuccess = () => res(req.result); });
    if (anunciosGuardados.length === 0) return;

    for (const anuncio of anunciosGuardados) {
        try {
            const formData = new FormData();
            formData.append('usuario_id', anuncio.usuario_id); formData.append('titulo', anuncio.titulo); formData.append('descricao', anuncio.descricao); formData.append('preco', anuncio.preco); formData.append('local', anuncio.local); formData.append('contato', anuncio.contato);
            if (anuncio.imagem_0) formData.append('imagem_0', anuncio.imagem_0); if (anuncio.imagem_1) formData.append('imagem_1', anuncio.imagem_1); if (anuncio.imagem_2) formData.append('imagem_2', anuncio.imagem_2);
            
            const response = await fetch('salvar_anuncio.php', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.status === true) {
                const txDelete = db.transaction('anuncios_pendentes', 'readwrite'); txDelete.objectStore('anuncios_pendentes').delete(anuncio.id);
                self.clients.matchAll().then(clients => { clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETO' })); });
            }
        } catch (err) { return; }
    }
    self.registration.showNotification('Ocean Coffee', { body: 'A internet voltou e seu anúncio foi publicado!', icon: 'IMG/Loginho2.png', data: { url: '/meus-anuncios.html' } });
}

// 2. Processar Edição
async function processarEdicoesOffline() {
    const db = await abrirCofreOffline();
    const tx = db.transaction('edicoes_pendentes', 'readonly');
    const edicoesGuardadas = await new Promise(res => { const req = tx.objectStore('edicoes_pendentes').getAll(); req.onsuccess = () => res(req.result); });
    if (edicoesGuardadas.length === 0) return;

    for (const edicao of edicoesGuardadas) {
        try {
            const formData = new FormData();
            formData.append('id', edicao.anuncio_id); formData.append('titulo', edicao.titulo); formData.append('descricao', edicao.descricao); formData.append('preco', edicao.preco); formData.append('local', edicao.local); formData.append('contato', edicao.contato); formData.append('imagem_0', edicao.imagem_0); formData.append('imagem_1', edicao.imagem_1); formData.append('imagem_2', edicao.imagem_2);
            
            const response = await fetch('atualizar_anuncio.php', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.status === true) {
                const txDelete = db.transaction('edicoes_pendentes', 'readwrite'); txDelete.objectStore('edicoes_pendentes').delete(edicao.id_local);
                self.clients.matchAll().then(clients => { clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETO' })); });
            }
        } catch (err) { return; }
    }
    self.registration.showNotification('Ocean Coffee', { body: 'A internet voltou e as alterações no seu anúncio foram salvas!', icon: 'IMG/Loginho2.png', data: { url: '/meus-anuncios.html' } });
}

// 3. Processar Exclusão do Cliente
async function processarExclusoesOffline() {
    const db = await abrirCofreOffline();
    const tx = db.transaction('exclusoes_pendentes', 'readonly');
    const exclusoesGuardadas = await new Promise(res => { const req = tx.objectStore('exclusoes_pendentes').getAll(); req.onsuccess = () => res(req.result); });
    if (exclusoesGuardadas.length === 0) return;

    for (const exclusao of exclusoesGuardadas) {
        try {
            const response = await fetch('excluir_anuncio.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: exclusao.anuncio_id }) });
            const data = await response.json();
            if (data.status === true) {
                const txDelete = db.transaction('exclusoes_pendentes', 'readwrite'); txDelete.objectStore('exclusoes_pendentes').delete(exclusao.id_local);
                self.clients.matchAll().then(clients => { clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETO' })); });
            }
        } catch (err) { return; }
    }
    self.registration.showNotification('Ocean Coffee', { body: 'Lixeira sincronizada com sucesso.', icon: 'IMG/Loginho2.png', data: { url: '/meus-anuncios.html' } });
}

// 4. Processar Ações do Admin (Aprovar / Rejeitar) - NOVIDADE!
async function processarAcoesAdminOffline() {
    const db = await abrirCofreOffline();
    const tx = db.transaction('admin_acoes_pendentes', 'readonly');
    const acoesGuardadas = await new Promise(res => { const req = tx.objectStore('admin_acoes_pendentes').getAll(); req.onsuccess = () => res(req.result); });
    if (acoesGuardadas.length === 0) return;

    for (const acao of acoesGuardadas) {
        try {
            let url = '', corpo = {};
            
            // Verifica se a ordem é aprovar ou rejeitar
            if (acao.tipo === 'aprovar') {
                url = 'atualizar_status.php';
                corpo = { id: acao.anuncio_id, status: 'aprovado' };
            } else if (acao.tipo === 'rejeitar') {
                url = 'admin_rejeitar_anuncio.php';
                corpo = { id: acao.anuncio_id, motivo: acao.motivo };
            }

            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
            const data = await response.json();
            
            if (data.status === true) {
                const txDelete = db.transaction('admin_acoes_pendentes', 'readwrite');
                txDelete.objectStore('admin_acoes_pendentes').delete(acao.id_local);
                self.clients.matchAll().then(clients => { clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETO_ADMIN' })); });
            }
        } catch (err) { return; } // A internet caiu de novo no meio, ele tenta dps
    }
    
    // Avisa o Admin que a sincronização terminou
    self.registration.showNotification('Admin Ocean Coffee', { body: 'A internet voltou! Suas aprovações e rejeições foram sincronizadas.', icon: 'IMG/Loginho2.png', data: { url: '/Solicitações.html' } });
}