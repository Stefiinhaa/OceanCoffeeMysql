document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById('uploadInput');
  const previewContainer = document.getElementById('previewContainer');
  const form = document.querySelector('form');

  uploadInput.addEventListener('change', function () {
    const files = Array.from(this.files);
    const imagensAtuais = previewContainer.querySelectorAll('.img-preview').length;
    const espacoDisponivel = 3 - imagensAtuais;

    if (espacoDisponivel <= 0) {
      alert("Você já adicionou o máximo de 3 imagens.");
      this.value = "";
      return;
    }

    const arquivosPermitidos = files.slice(0, espacoDisponivel);

    arquivosPermitidos.forEach(file => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('img-wrapper');

        const img = document.createElement('img');
        img.src = e.target.result;
        img.classList.add('img-preview');

        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.classList.add('close-btn');

        closeBtn.addEventListener('click', () => {
          previewContainer.removeChild(imgWrapper);
        });

        imgWrapper.appendChild(img);
        imgWrapper.appendChild(closeBtn);
        previewContainer.appendChild(imgWrapper);
      };

      reader.readAsDataURL(file);
    });

    this.value = "";
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const previews = document.querySelectorAll('.img-preview');
      previews.forEach((img, index) => {
         formData.append('imagem_' + index, img.src);
      });
      
      const usuarioStr = localStorage.getItem("usuarioLogado");
      if (usuarioStr) {
         const usuario = JSON.parse(usuarioStr);
         formData.append('usuario_id', usuario.id);
      }

      const resposta = await fetch('salvar_anuncio.php', {
        method: 'POST',
        body: formData
      });
      
      const dados = await resposta.json();
      if (dados.status === true) {
         alert('Anúncio enviado com sucesso!');
         window.location.href = 'meus-anuncios.html';
      } else {
         alert('Ocorreu um erro: ' + dados.mensagem);
      }
    });
  }
});