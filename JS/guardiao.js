import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.1/+esm";

const supabaseUrl = "https://uldxazlnnpuoxfzsovmu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZHhhemxubnB1b3hmenNvdm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3Mjg2NzgsImV4cCI6MjA2NDMwNDY3OH0.fyToys8_muc1XyUebJ19gxGEkCVM_cXg80UJR894xQY";
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para proteger páginas que exigem login
export async function protegerPagina() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // Se não houver sessão, redireciona para o login
        window.location.replace('Login.html');
    }
}

// Função para a página de login: se já estiver logado, vai para o perfil
export async function verificarSessaoLogin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // Se JÁ EXISTE uma sessão, redireciona para o perfil
        window.location.replace('perfil.html');
    }
}