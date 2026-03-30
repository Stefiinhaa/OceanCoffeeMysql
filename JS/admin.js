const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      });
    });
function alternarStatusVendido(idAnuncio, statusAtual) {
    const novoStatus = statusAtual == 1 ? 0 : 1; // Se está vendido, desmarca. Se não está, marca.
    
    fetch('admin_marcar_vendido.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: idAnuncio, vendido: novoStatus })
    })
    .then(response => response.json())
    .then(data => {
        if(data.status) {
            alert('Status atualizado!');
            location.reload(); // Recarrega para ver a mudança
        } else {
            alert('Erro ao atualizar: ' + data.mensagem);
        }
    })
    .catch(error => console.error('Erro:', error));
}