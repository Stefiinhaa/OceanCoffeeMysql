export function protegerPagina() {
    const usuario = localStorage.getItem("usuarioLogado");
    if (!usuario) {
        window.location.replace('Login.html');
    }
}

export function verificarSessaoLogin() {
    const usuario = localStorage.getItem("usuarioLogado");
    if (usuario) {
        window.location.replace('perfil.html');
    }
}