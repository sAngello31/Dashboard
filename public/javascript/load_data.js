import {ciudadesEcuador} from './static_data.js';
import {validarChart, makeBarChart, makeLineChart} from './makeCharts.js';

let fechaActual = () => new Date().toISOString().slice(0,10);
let tiempoArr = [];

(function (){
    let menu = document.getElementById("opcionesCiudades");
    for(let clave in ciudadesEcuador){
        let option = document.createElement("option");
        option.textContent = clave;
        option.value = clave;
        menu.appendChild(option);
    }
})();

(function(){
    let coleccionHTML = document.getElementsByTagName("h6");
    let tituloH6 = coleccionHTML[0];
    tituloH6.textContent = fechaActual();
})();


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

let cargarPromedios = (arrJSONDatos, clase, unidad) =>{
    let datos = filtrar(arrJSONDatos);
    let mediciones = sacarPromedios(datos);

    let minValue = document.getElementById(`${clase}MinValue`);
    let promValue = document.getElementById(`${clase}PromValue`);
    let maxValue = document.getElementById(`${clase}MaxValue`);

    minValue.textContent = `Min: ${mediciones[0]} ${unidad}`
    promValue.textContent = `Prom: ${Math.round(mediciones[1]*100) /100} ${unidad}`
    maxValue.textContent = `Max: ${mediciones[2]} ${unidad}`
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

        tiempoArr = responseJSON.hourly.time
        makeLineChart(
            responseJSON.hourly.temperature_2m,
            0,
            "plot1",
            tiempoArr,
            "Temperature [2m]"
        );
        makeLineChart(
            responseJSON.hourly.wind_speed_10m,
            2,
            "plot3",
            tiempoArr,
            "Velocidad del Viento"
        );
        makeBarChart(
            responseJSON.daily.uv_index_max,
            1,
            "plot2",
            responseJSON.daily.time,
            "Indice de Rayos UV"
        );

        
        cargarPromedios(responseJSON.hourly.temperature_2m, "temperatura", "[°C]");
        cargarPromedios(responseJSON.hourly.wind_speed_10m, "viento", "[km/h]");
        cargarPromedios(responseJSON.hourly.relative_humidity_2m, "humedad", "[%]")
        
    }).catch(console.error);
}

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


let renderExternalTable = (text) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/html");
        let elemento = xml.querySelector("#postcontent table");
        let elementoDOM = document.getElementById("monitoreo");
        elementoDOM.innerHTML = elemento.outerHTML;
}

(function (){
    let selectElement = document.querySelector("select");
    selectElement.addEventListener("change", selectListener);
})();

(async function() {
    let corseStorage = localStorage.getItem("corseItems");
    if(corseStorage == null){
        try{
        
            let proxyURL = 'https://cors-anywhere.herokuapp.com/'
            let endpoint = proxyURL + 'https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/'
    
            let response = await fetch(endpoint);
            let responseText = await response.text();

            localStorage.setItem("corseItems", responseText);
            renderExternalTable(responseText);
            
        } catch(error){
            console.log(error);
        }
    }else{
        renderExternalTable(corseStorage);
    }
    
})();


