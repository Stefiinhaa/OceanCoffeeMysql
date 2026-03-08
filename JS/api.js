// --- INÍCIO DO CÓDIGO JAVASCRIPT CORRIGIDO ---

// =======================================================================
//  1. DEFINIÇÕES DE FUNÇÕES (Apenas definindo, não executando)
// =======================================================================

/**
 * Retorna o gradiente de fundo com base no código do clima.
 */
function getTempBackground(code, isDay) {
    const colors = {
        dayClear:   'linear-gradient(170deg, #3786dd, #63a4ff)',
        nightClear: 'linear-gradient(170deg, #1c2541, #3a506b)',
        cloudy:     'linear-gradient(170deg, #8a9aab, #b8c2cc)',
        rain:       'linear-gradient(170deg, #4b6584, #778ca3)',
        storm:      'linear-gradient(170deg, #2f3640, #485460)',
        snowAndFog: 'linear-gradient(170deg, #d2dae2, #eef2f3)',
    };

    switch (true) {
        case (code <= 1): return isDay ? colors.dayClear : colors.nightClear;
        case (code >= 2 && code <= 3): return colors.cloudy;
        case (code === 45 || code === 48): return colors.snowAndFog;
        case (code >= 51 && code <= 67 || (code >= 80 && code <= 82)): return colors.rain;
        case (code >= 71 && code <= 77): return colors.snowAndFog;
        case (code >= 95 && code <= 99): return colors.storm;
        default: return colors.cloudy;
    }
}

/**
 * Retorna a descrição textual do clima.
 */
function getWeatherDescription(code) {
    const descriptions = {
        0: 'Céu limpo', 1: 'Quase limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
        45: 'Nevoeiro', 48: 'Nevoeiro com gelo', 51: 'Garoa leve',
        53: 'Garoa moderada', 55: 'Garoa intensa', 56: 'Garoa com gelo (leve)',
        57: 'Garoa com gelo (intensa)', 61: 'Chuva leve', 63: 'Chuva moderada',
        65: 'Chuva forte', 66: 'Chuva com gelo (leve)', 67: 'Chuva com gelo (forte)',
        71: 'Neve leve', 73: 'Neve moderada', 75: 'Neve forte', 77: 'Grãos de neve',
        80: 'Pancadas de chuva (leve)', 81: 'Pancadas de chuva (moderada)', 82: 'Pancadas de chuva (violenta)',
        85: 'Pancadas de neve (leve)', 86: 'Pancadas de neve (forte)',
        95: 'Trovoada', 96: 'Trovoada com granizo (leve)', 99: 'Trovoada com granizo (forte)',
    };
    return descriptions[code] || 'Condição desconhecida';
}

/**
 * Retorna a classe do ícone do FontAwesome.
 */
function getWeatherIconFaClass(code, isDay) {
    switch (true) {
        case (code === 0): return isDay ? 'fa-sun' : 'fa-moon';
        case (code === 1 || code === 2): return isDay ? 'fa-cloud-sun' : 'fa-cloud-moon';
        case (code === 3): return 'fa-cloud';
        case (code === 45 || code === 48): return 'fa-smog';
        case (code >= 51 && code <= 57): return 'fa-cloud-drizzle';
        case (code >= 61 && code <= 67): return 'fa-cloud-rain';
        case (code >= 71 && code <= 77): return 'fa-snowflake';
        case (code >= 80 && code <= 82): return 'fa-cloud-showers-heavy';
        case (code >= 95 && code <= 99): return 'fa-cloud-bolt';
        default: return 'fa-temperature-half';
    }
}

/**
 * Mostra a caixa de alerta.
 */
function showAlert(msg) {
    const alertBox = document.querySelector("#alert");
    if (!alertBox) return; // Verificação de segurança
    alertBox.textContent = msg;
    if (msg) {
        alertBox.style.display = 'block';
        setTimeout(() => { alertBox.style.display = 'none'; }, 5000);
    } else {
        alertBox.style.display = 'none';
    }
}

/**
 * Exibe as informações do clima no popup.
 */
function showInfo(weatherData) {
    // Seletores são movidos para DENTRO da função
    const weatherToggle = document.querySelector("#weather-toggle");
    const weatherEl = document.querySelector("#weather");
    const titleEl = document.querySelector("#title");
    const tempValueEl = document.querySelector("#temp_value");
    const tempDescriptionEl = document.querySelector("#temp_description");
    const tempIconEl = document.querySelector("#temp_icon");
    const tempContainerEl = document.querySelector("#temp");
    const tempMaxEl = document.querySelector("#temp_max");
    const tempMinEl = document.querySelector("#temp_min");
    const humidityEl = document.querySelector("#humidity");
    const windEl = document.querySelector("#wind");

    // Verifica se os elementos essenciais existem
    if (!weatherData || !weatherEl || !weatherToggle) {
        showAlert("Não foi possível obter os dados do clima.");
        return;
    }
    showAlert("");
    weatherEl.classList.add("show");

    const description = getWeatherDescription(weatherData.weathercode);
    const faClass = getWeatherIconFaClass(weatherData.weathercode, weatherData.isDay);
    const backgroundStyle = getTempBackground(weatherData.weathercode, weatherData.isDay);

    titleEl.textContent = `${weatherData.city}, ${weatherData.country}`;
    tempValueEl.innerHTML = `${weatherData.temp.toFixed(1).replace(".", ",")} <sup>C°</sup>`;
    tempDescriptionEl.textContent = description;

    weatherToggle.querySelector("i").className = "fa-solid " + faClass;
    tempIconEl.className = "fa-solid " + faClass;
    tempContainerEl.style.background = backgroundStyle;
    tempMaxEl.innerHTML = `${weatherData.tempMax.toFixed(1).replace(".", ",")} <sup>C°</sup>`;
    tempMinEl.innerHTML = `${weatherData.tempMin.toFixed(1).replace(".", ",")} <sup>C°</sup>`;
    humidityEl.textContent = `${weatherData.humidity}%`;
    windEl.textContent = `${weatherData.windSpeed.toFixed(1)} km/h`;
    weatherToggle.querySelector("span").textContent = `${weatherData.temp.toFixed(1).replace(".", ",")}°C`;
}

/**
 * Busca dados do clima na API Open-Meteo.
 */
async function fetchWeather(lat, lon) {
    const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await fetch(meteoUrl);
    const data = await response.json();

    if (!data.current || !data.daily) {
        throw new Error("Dados climáticos da API incompletos.");
    }

    return {
        temp: data.current.temperature_2m,
        tempMax: data.daily.temperature_2m_max[0],
        tempMin: data.daily.temperature_2m_min[0],
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        weathercode: data.current.weathercode,
        isDay: data.current.is_day
    };
}

/**
 * Busca e exibe o clima para uma cidade específica (usado na busca e como fallback).
 */
async function fetchWeatherByCity(cityName, isFallback = false) {
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            if (!isFallback) { // Não mostra erro se for apenas o fallback silencioso
                showAlert(`Não foi possível encontrar a cidade "${cityName}".`);
            }
            return; // Falha silenciosamente no fallback
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country_code } = location;
        const weatherData = await fetchWeather(latitude, longitude);
        showInfo({ ...weatherData, city: name, country: country_code });
        
        if (isFallback) {
            showAlert("Mostrando clima para São Paulo. Busque sua cidade.");
        }

    } catch (err) {
        console.error("Erro ao buscar por cidade:", err);
        if (!isFallback) {
            showAlert("Ocorreu um erro ao buscar. Verifique sua conexão.");
        }
    }
}

/**
 * Tenta obter a localização inicial do usuário ou usa o fallback.
 */
async function fetchInitialLocation() {
    if (!("geolocation" in navigator)) {
        showAlert("Seu navegador não suporta geolocalização.");
        await fetchWeatherByCity("São Paulo", true); // <-- FALLBACK
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => { // SUCESSO
            try {
                const { latitude, longitude } = position.coords;
                const geoRes = await fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`);
                const geoData = await geoRes.json();
                const cidade = geoData.address?.city || geoData.address?.town || geoData.address?.village || "Sua Localização";
                const pais = geoData.address?.country_code?.toUpperCase() || "";
                const weatherData = await fetchWeather(latitude, longitude);
                showInfo({ ...weatherData, city: cidade, country: pais });
            } catch (err) {
                console.error("Erro ao buscar clima inicial:", err);
                showAlert("Não foi possível carregar o clima local.");
                await fetchWeatherByCity("São Paulo", true); // <-- FALLBACK
            }
        },
        async () => { // ERRO OU PERMISSÃO NEGADA
            showAlert("Permissão de localização negada.");
            await fetchWeatherByCity("São Paulo", true); // <-- FALLBACK
        }
    );
}

/**
 * Busca e atualiza a cotação do Dólar.
 */
let ultimoValorDolar = null;
async function atualizarDolar() {
    const dolarElement = document.querySelector('.dolar');
    if (!dolarElement) {
        console.error("Elemento .dolar não encontrado.");
        return; // Sai da função se o elemento não existir
    }

    try {
        const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
        const dados = await res.json();
        const valorAtual = parseFloat(dados.USDBRL.ask);
        let icone = '<i class="fa-solid fa-arrow-right" style="color: #999;"></i>';
        if (ultimoValorDolar !== null) {
            if (valorAtual > ultimoValorDolar) icone = '<i class="fa-solid fa-arrow-up" style="color: #00ad1d;"></i>';
            else if (valorAtual < ultimoValorDolar) icone = '<i class="fa-solid fa-arrow-down" style="color: #e00000;"></i>';
        }
        ultimoValorDolar = valorAtual;
        dolarElement.innerHTML = `${icone} <span>U$ ${valorAtual.toFixed(2)}</span>`;
    } catch (erro) {
        console.error("Erro ao buscar o valor do dólar:", erro);
        dolarElement.textContent = "Erro ao carregar dólar";
    }
}


// =======================================================================
//  2. PONTO DE ENTRADA (Executa quando o HTML está pronto)
// =======================================================================

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Seletores para Event Listeners ---
    const searchForm = document.querySelector("#search");
    const container = document.querySelector("#container");
    const closePopup = document.querySelector("#close-popup");
    const weatherToggleBtn = document.querySelector("#weather-toggle");

    // Verificação profissional de elementos
    if (!searchForm || !container || !closePopup || !weatherToggleBtn) {
        console.error("Falha ao inicializar o widget de clima. Elementos essenciais do DOM não foram encontrados.");
        return; // Para a execução se o HTML estiver quebrado
    }
    
    // --- Adiciona Event Listeners ---

    // Listener para o formulário de busca de cidade
    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        showAlert(""); // Limpa alertas
        const city = document.querySelector("#city_name").value.trim();
        if (!city) return;
        await fetchWeatherByCity(city, false); // Usa a nova função refatorada
    });

    // Listeners para o comportamento do popup de clima (hover/click)
    let openedByClick = false;
    weatherToggleBtn.addEventListener("mouseenter", () => !openedByClick && container.classList.add("show"));
    weatherToggleBtn.addEventListener("mouseleave", () => setTimeout(() => !container.matches(":hover") && !openedByClick && container.classList.remove("show"), 200));
    weatherToggleBtn.addEventListener("click", () => { container.classList.add("show"); openedByClick = true; });
    closePopup.addEventListener("click", () => { container.classList.remove("show"); openedByClick = false; });
    document.addEventListener("click", (e) => { if (!container.contains(e.target) && !weatherToggleBtn.contains(e.target) && openedByClick) { container.classList.remove("show"); openedByClick = false; }});
    container.addEventListener("mouseleave", () => !openedByClick && container.classList.remove("show"));

    // --- Execução Inicial ---
    fetchInitialLocation(); // Busca o clima da localização atual (agora com fallback)
    atualizarDolar(); // Busca o dólar pela primeira vez
    setInterval(atualizarDolar, 60000); // Atualiza o dólar a cada 60 segundos
});
// --- FIM DO CÓDIGO JAVASCRIPT ---