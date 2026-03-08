document.getElementById("form-login").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const resposta = await fetch("processar_login.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email, senha: senha })
    });

    const dados = await resposta.json();

    if (dados.status === true) {
        localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));
        window.location.href = "dashboard.html";
    } else {
        alert(dados.mensagem);
    }
});