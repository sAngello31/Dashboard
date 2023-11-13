import {ciudadesEcuador} from './static_data.js';

let fechaActual = () => new Date().toISOString().slice(0,10);
let tiempoArr = [];
let chart1 = null;
let chart2 = null
let arrChart = [chart1, chart2];

// Aqui inicia los promedios y gráficos
let filtrar = (arregloDatos) => {
    let datos = [];
    let fecha = fechaActual();
    for(let i=0; i<tiempoArr.length; i++){
        if(tiempoArr[i].includes(fecha)){
            datos.push(arregloDatos[i]);
        }
    }

    return datos;
}

let sacarPromedios = (arrDatos) => {
    let datos = [];
    let max = Math.max(...arrDatos);
    let min = Math.min(...arrDatos);
    let sum = arrDatos.reduce((a,b) => a+b, 0);
    let promedio = (sum/arrDatos.length) || 0;

    datos = [min, promedio, max];
    return datos;
}

let validarChart = () => {
    for(let i in arrChart){
        if(arrChart[i] != null){
            arrChart[i].destroy();
        }
    }
}

let llenarCiudades = () =>{
    let menu = document.getElementById("opcionesCiudades");
    for(let clave in ciudadesEcuador){
        let option = document.createElement("option");
        option.textContent = clave;
        option.value = clave;
        menu.appendChild(option);
    }
}


let cargarFechaActual = () => {
    let coleccionHTML = document.getElementsByTagName("h6");
    let tituloH6 = coleccionHTML[0];
    tituloH6.textContent = fechaActual();
}

let makeChart = (data) => {
        let plotRef = document.getElementById("plot1");
        let plotRef2 = document.getElementById("plot2");
        let config1 = {
            type: 'line',
            data: {
              labels: data.hourly.time, 
              datasets: [
                {
                  label: 'Temperature [2m]',
                  data: data.hourly.temperature_2m, 
                }
              ]
            },
            options: {
                responsive: true
            }
        };

        let config2 = {
            type: 'bar',
            data: {
              labels: data.daily.time, 
              datasets: [
                {
                  label: 'Índices UV Semanales',
                  data: data.daily.uv_index_max, 
                }
              ]
            },
            options: {
                responsive: true
            }
        }

        arrChart[0]  = new Chart(plotRef, config1);
        arrChart[1] = new Chart(plotRef2, config2);
}

let cargarOpenMeteor = (urlCiudad) => {
    validarChart();
    fetch(urlCiudad).then(responseText => responseText.json()).then(responseJSON => {
        
        let latitud = document.getElementById("latitud");
        let longitud = document.getElementById("longitud");
        let elevacion = document.getElementById("elevacion");

        elevacion.textContent = responseJSON.elevation;
        latitud.textContent = responseJSON.latitude;
        longitud.textContent = responseJSON.longitude;


        makeChart(responseJSON);
        tiempoArr = responseJSON.hourly.time
        cargarTemperatura(responseJSON.hourly.temperature_2m);
        cargarViento(responseJSON.hourly.wind_speed_10m);
        cargarPrecipitacion(responseJSON.hourly.relative_humidity_2m);
        
    }).catch(console.error);
}

//Ahora precipitacion es para referirse a humedad xd
let cargarPrecipitacion = (arrJSONDatos) => {
    let datosPrecipitaciones = filtrar(arrJSONDatos);
    let mediciones = sacarPromedios(datosPrecipitaciones);

    let precipitacionMinValue = document.getElementById("precipitacionMinValue");
    let precipitacionPromValue = document.getElementById("precipitacionPromValue");
    let precipitacionMaxValue = document.getElementById("precipitacionMaxValue");

    precipitacionMinValue.textContent = `Min ${mediciones[0]} [%]`;
    precipitacionPromValue.textContent = `Prom ${Math.round(mediciones[1]*100) / 100} [%]`;
    precipitacionMaxValue.textContent = `Max ${mediciones[2]} [%]`;
}

let cargarViento = (arrJSONDatos) => {
    let datosUV = filtrar(arrJSONDatos);
    let mediciones = sacarPromedios(datosUV);

    let uvMinValue = document.getElementById("uvMinValue");
    let uvPromValue = document.getElementById("uvPromValue");
    let uvMaxValue = document.getElementById("uvMaxValue");

    uvMinValue.textContent = `Min ${mediciones[0]} [km/h]`;
    uvPromValue.textContent = `Prom ${Math.round(mediciones[1]*100) / 100} [km/h]`;
    uvMaxValue.textContent = `Max ${mediciones[2]} [km/h]`;
}

let cargarTemperatura = (arrJSONDatos) => {
    let datosTemp = filtrar(arrJSONDatos);
    let mediciones = sacarPromedios(datosTemp);

    let temperaturaMinValue = document.getElementById("temperaturaMinValue");
    let temperaturaPromValue = document.getElementById("temperaturaPromValue");
    let temperaturaMaxValue = document.getElementById("temperaturaMaxValue");

    temperaturaMinValue.textContent = `Min ${mediciones[0]} [°C]`;
    temperaturaPromValue.textContent = `Prom ${Math.round(mediciones[1]*100) / 100} [°C]`;
    temperaturaMaxValue.textContent =  `Max ${mediciones[2]} [°C]`;
}



//Aqui acaba los promedioss

let parseXML = (responseText) => {
  
    // Parsing XML
    const parser = new DOMParser();
    const xml = parser.parseFromString(responseText, "application/xml");

    let forecastElement = document.querySelector("#forecastbody")
    let ciudad = document.getElementById("coordenadas");
    

    forecastElement.innerHTML = ''

    // Procesamiento de los elementos con etiqueta `<time>` del objeto xml
    let timeArr = xml.querySelectorAll("time")

    timeArr.forEach(time => {
        
        let from = time.getAttribute("from").replace("T", " ")

        let humidity = time.querySelector("humidity").getAttribute("value")
        let windSpeed = time.querySelector("windSpeed").getAttribute("mps");
        let precipitation = time.querySelector("precipitation ").getAttribute("probability");
        let pressure = time.querySelector("pressure").getAttribute("value");
        let cloud = time.querySelector("clouds").getAttribute("all");

        let template = `
            <tr>
                <td>${from}</td>
                <td>${humidity}</td>
                <td>${windSpeed}</td>
                <td>${precipitation}</td>
                <td>${pressure}</td>
                <td>${cloud}</td>
            </tr>
        `

        //Renderizando la plantilla en el elemento HTML
        forecastElement.innerHTML += template;
    })
}


//Callback
let selectListener = async (event) => {
    let selectedCity = event.target.value
    let cityStorage = localStorage.getItem(selectedCity);

    if(cityStorage == null){
        try {

            //API key
            let APIkey = 'f1fb8311364a9975b722abe6aa59787d';
            let url = `https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&mode=xml&appid=${APIkey}`
            
            let response = await fetch(url);
            let responseText = await response.text();
            await cargarOpenMeteor(ciudadesEcuador[selectedCity]);
            await parseXML(responseText);
            await localStorage.setItem(selectedCity, responseText);
    
        } catch (error) {
            console.log(error)
        }
    } else{
        parseXML(cityStorage);
        cargarOpenMeteor(ciudadesEcuador[selectedCity]); //CORREGIR ESTO
    }
}

let loadForecastByCity = () => {
    //Handling event
    let selectElement = document.querySelector("select");
    selectElement.addEventListener("change", selectListener);
  
}

llenarCiudades();
cargarFechaActual();
loadForecastByCity();

