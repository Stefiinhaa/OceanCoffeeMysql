// JS/dolar-api.js

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Variáveis Globais
    let ultimoValorDolar = null;
    const dolarElement = document.querySelector('.dolar');

    if (!dolarElement) {
        console.error("Elemento '.dolar' não foi encontrado no DOM.");
        return; 
    }

    // --- API PRINCIPAL (AwesomeAPI) ---
    async function buscarAPIPrincipal() {
        const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
        if (!res.ok) throw new Error("API Principal falhou na resposta.");
        const dados = await res.json();
        if (!dados || !dados.USDBRL || !dados.USDBRL.ask) throw new Error("Formato da API Principal inválido.");
        return parseFloat(dados.USDBRL.ask);
    }

    // --- API RESERVA (Open Exchange Rates) ---
    async function buscarAPIReserva() {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) throw new Error("API Reserva falhou na resposta.");
        const dados = await res.json();
        if (!dados || !dados.rates || !dados.rates.BRL) throw new Error("Formato da API Reserva inválido.");
        return parseFloat(dados.rates.BRL);
    }

    // --- FUNÇÃO DE ATUALIZAÇÃO BLINDADA ---
    async function atualizarDolar() {
        try {
            let valorAtual = null;

            // 1. Tenta a API Principal
            try {
                valorAtual = await buscarAPIPrincipal();
            } catch (erroPrincipal) {
                console.warn("Aviso: API Principal do dólar falhou. Tentando a API Reserva...", erroPrincipal);
                
                // 2. Se a Principal falhar, o código não quebra e tenta a API Reserva
                valorAtual = await buscarAPIReserva();
            }

            // Se conseguiu o valor (seja da 1ª ou da 2ª API), monta o visual
            let icone = '<i class="fa-solid fa-arrow-right" style="color: #999;"></i>';
            
            if (ultimoValorDolar !== null) {
                if (valorAtual > ultimoValorDolar) {
                    icone = '<i class="fa-solid fa-arrow-up" style="color: #00ad1d;"></i>'; // Verde (Subiu)
                } else if (valorAtual < ultimoValorDolar) {
                    icone = '<i class="fa-solid fa-arrow-down" style="color: #e00000;"></i>'; // Vermelho (Caiu)
                }
            }
            
            ultimoValorDolar = valorAtual;
            dolarElement.innerHTML = `${icone} <span>U$ ${valorAtual.toFixed(2)}</span>`;
        
        } catch (erroCritico) {
            // Se as DUAS APIs estiverem fora do ar ao mesmo tempo
            console.error("Erro crítico: As duas APIs do dólar falharam.", erroCritico);
            dolarElement.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #e00000;" title="Cotação indisponível no momento"></i> <span>Indisponível</span>`;
        }
    }

    // Execução Inicial
    atualizarDolar(); 
    
    // Atualiza silenciosamente a cada 60 segundos
    setInterval(atualizarDolar, 60000); 
});