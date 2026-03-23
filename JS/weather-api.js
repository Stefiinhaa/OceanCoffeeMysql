document.addEventListener("DOMContentLoaded", () => {

    const searchForm = document.querySelector("#search");
    const container = document.querySelector("#container");
    const closePopup = document.querySelector("#close-popup");
    
    // Agora o código pega tanto o botão do PC quanto o do Celular
    const weatherToggleBtns = document.querySelectorAll("#weather-toggle, #weather-toggle-mobile");
    const alertBox = document.querySelector("#alert");

    if (!searchForm || !container || !closePopup || weatherToggleBtns.length === 0 || !alertBox) {
        return;
    }

    function getTempBackground(code, isDay) {
        const colors = {
            dayClear: 'linear-gradient(170deg, #3786dd, #63a4ff)',
            nightClear: 'linear-gradient(170deg, #1c2541, #3a506b)',
            cloudy: 'linear-gradient(170deg, #8a9aab, #b8c2cc)',
            rain: 'linear-gradient(170deg, #4b6584, #778ca3)',
            storm: 'linear-gradient(170deg, #2f3640, #485460)',
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

    function hideWidget() {
        weatherToggleBtns.forEach(btn => btn.style.display = 'none');
        container.style.display = 'none';
        alertBox.style.display = 'none';
    }

    function showInfo(weatherData) {
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

        if (!weatherData || !weatherEl) {
            hideWidget();
            return;
        }
        

        weatherToggleBtns.forEach(btn => btn.style.display = '');
        alertBox.style.display = 'none';
        weatherEl.classList.add("show");

        const description = getWeatherDescription(weatherData.weathercode);
        const faClass = getWeatherIconFaClass(weatherData.weathercode, weatherData.isDay);
        const backgroundStyle = getTempBackground(weatherData.weathercode, weatherData.isDay);

        titleEl.textContent = `${weatherData.city}, ${weatherData.country}`;
        tempValueEl.innerHTML = `${weatherData.temp.toFixed(1).replace(".", ",")} <sup>C°</sup>`;
        tempDescriptionEl.textContent = description;
        
        weatherToggleBtns.forEach(btn => {
            btn.querySelector("i").className = "fa-solid " + faClass;
            btn.querySelector("span").textContent = `${weatherData.temp.toFixed(1).replace(".", ",")}°C`;
        });

        tempIconEl.className = "fa-solid " + faClass;
        tempContainerEl.style.background = backgroundStyle;
        tempMaxEl.innerHTML = `${weatherData.tempMax.toFixed(1).replace(".", ",")} <sup>C°</sup>`;
        tempMinEl.innerHTML = `${weatherData.tempMin.toFixed(1).replace(".", ",")} <sup>C°</sup>`;
        humidityEl.textContent = `${weatherData.humidity}%`;
        windEl.textContent = `${weatherData.windSpeed.toFixed(1)} km/h`;
    }

    async function fetchWeather(lat, lon) {
        const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
        const response = await fetch(meteoUrl);
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!data.current || !data.daily) throw new Error();
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

    async function fetchWeatherByCity(cityName, isFallback = false) {
        try {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`;
            const geoRes = await fetch(geoUrl);
            if (!geoRes.ok) throw new Error();
            
            const geoData = await geoRes.json();
            if (!geoData.results || geoData.results.length === 0) {
                if (isFallback) hideWidget();
                return;
            }
            
            const location = geoData.results[0];
            const { latitude, longitude, name, country_code } = location;
            const weatherData = await fetchWeather(latitude, longitude);
            showInfo({ ...weatherData, city: name, country: country_code });
        
        } catch (err) {
            if (isFallback) hideWidget();
        }
    }
    async function fetchInitialLocation() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isMobile) {
            await fetchWeatherByCity("Garça", true);
            return;
        }

        if (!("geolocation" in navigator)) {
            await fetchWeatherByCity("Garça", true); 
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`);
                    if (!geoRes.ok) throw new Error();
                    
                    const geoData = await geoRes.json();
                    const cidade = geoData.city || geoData.locality || "Sua Localização";
                    const pais = geoData.countryCode || "";
                    
                    const weatherData = await fetchWeather(latitude, longitude);
                    showInfo({ ...weatherData, city: cidade, country: pais });
                
                } catch (err) {
                    await fetchWeatherByCity("Garça", true); 
                }
            },
            async () => {
                await fetchWeatherByCity("Garça", true); 
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }


    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        alertBox.style.display = 'none';
        const city = document.querySelector("#city_name").value.trim();
        if (!city) return;
        await fetchWeatherByCity(city, false);
    });

    let openedByClick = false;
    
    // Configura os cliques para os dois botões
    weatherToggleBtns.forEach(btn => {
        btn.addEventListener("mouseenter", () => !openedByClick && container.classList.add("show"));
        btn.addEventListener("mouseleave", () => setTimeout(() => !container.matches(":hover") && !openedByClick && container.classList.remove("show"), 200));
        btn.addEventListener("click", () => { container.classList.add("show"); openedByClick = true; });
    });
    
    closePopup.addEventListener("click", () => { container.classList.remove("show"); openedByClick = false; });
    
    document.addEventListener("click", (e) => { 
        let clicouNoBotao = Array.from(weatherToggleBtns).some(btn => btn.contains(e.target));
        if (!container.contains(e.target) && !clicouNoBotao && openedByClick) { 
            container.classList.remove("show"); 
            openedByClick = false; 
        }
    });
    
    container.addEventListener("mouseleave", () => !openedByClick && container.classList.remove("show"));

    fetchInitialLocation(); 
});