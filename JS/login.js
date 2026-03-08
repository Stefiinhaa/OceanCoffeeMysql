import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.1/+esm";
import { verificarSessaoLogin } from './guardiao.js';

// Primeiro, verifica se o usuário já não está logado
verificarSessaoLogin();

const supabaseUrl = "https://uldxazlnnpuoxfzsovmu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZHhhemxubnB1b3hmenNvdm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3Mjg2NzgsImV4cCI6MjA2NDMwNDY3OH0.fyToys8_muc1XyUebJ19gxGEkCVM_cXg80UJR894xQY";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                alert('Por favor, preencha o e-mail e a senha.');
                return;
            }

            loginButton.disabled = true;
            loginButton.textContent = 'Entrando...';

            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                alert('E-mail ou senha inválidos. Verifique seus dados.');
                loginButton.disabled = false;
                loginButton.textContent = 'Entrar';
            } else if (data.user) {
                // Sucesso! Redireciona para o perfil.
                window.location.href = 'perfil.html';
            }
        });
    }
});