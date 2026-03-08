// JS/dolar-api.js

// Espera o HTML estar pronto
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Variáveis Globais para este script
    let ultimoValorDolar = null;
    const dolarElement = document.querySelector('.dolar');

    // 2. Verifica se o elemento HTML existe
    if (!dolarElement) {
        console.error("Elemento '.dolar' não foi encontrado no DOM.");
        return; // Para o script se não encontrar o <div>
    }

    // 3. Função principal para buscar o dólar
    async function atualizarDolar() {
        try {
            const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
            
            // Verifica se a resposta da rede foi OK (ex: 200)
            if (!res.ok) {
                throw new Error(`Falha na rede da API: ${res.status}`);
            }

            const dados = await res.json();

            // Verifica se a resposta JSON tem a estrutura esperada
            if (!dados || !dados.USDBRL || !dados.USDBRL.ask) {
                throw new Error("Resposta da API de dólar em formato inesperado.");
            }

            // Se tudo deu certo, atualiza o valor
            const valorAtual = parseFloat(dados.USDBRL.ask);
            let icone = '<i class="fa-solid fa-arrow-right" style="color: #999;"></i>';
            
            if (ultimoValorDolar !== null) {
                if (valorAtual > ultimoValorDolar) {
                    icone = '<i class="fa-solid fa-arrow-up" style="color: #00ad1d;"></i>'; // Verde
                } else if (valorAtual < ultimoValorDolar) {
                    icone = '<i class="fa-solid fa-arrow-down" style="color: #e00000;"></i>'; // Vermelho
                }
            }
            
            ultimoValorDolar = valorAtual;
            dolarElement.innerHTML = `${icone} <span>U$ ${valorAtual.toFixed(2)}</span>`;
        
        } catch (erro) {
            // Se qualquer coisa no 'try' falhar, mostra um erro claro
            console.error("Erro ao buscar o valor do dólar:", erro);
            dolarElement.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #e00000;" title="${erro.message}"></i> <span>Dólar</span>`;
        }
    }

    // 4. Execução Inicial
    atualizarDolar(); // Busca o dólar pela primeira vez
    setInterval(atualizarDolar, 60000); // Atualiza a cada 60 segundos
});