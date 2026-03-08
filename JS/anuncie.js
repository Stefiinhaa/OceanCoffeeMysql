document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById('uploadInput');
  const previewContainer = document.getElementById('previewContainer');

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

        // Ao clicar no "X", remove a imagem
        closeBtn.addEventListener('click', () => {
          previewContainer.removeChild(imgWrapper);
        });

        imgWrapper.appendChild(img);
        imgWrapper.appendChild(closeBtn);
        previewContainer.appendChild(imgWrapper);
      };

      reader.readAsDataURL(file);
    });

    this.value = ""; // limpa input
  });
});

  

  