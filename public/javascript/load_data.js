
let fechaActual = () => new Date().toISOString().slice(0,10);
let tiempoArr = [];

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

let cargarOpenMeteor = () => {
    let URL = "https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&current=precipitation&hourly=temperature_2m,precipitation,windspeed_10m&timezone=auto";
    fetch(URL).then(responseText => responseText.json()).then(responseJSON => {
        let plotRef = document.getElementById("plot1");
        let labels1 = responseJSON.hourly.time;
        let data1 = responseJSON.hourly.temperature_2m;
        let config1 = {
            type: 'line',
            data: {
              labels: labels1, 
              datasets: [
                {
                  label: 'Temperature [2m]',
                  data: data1, 
                }
              ]
            }
        };
        tiempoArr = responseJSON.hourly.time
        cargarTemperatura(responseJSON.hourly.temperature_2m);
        cargarViento(responseJSON.hourly.windspeed_10m);
        cargarPrecipitacion(responseJSON.hourly.precipitation);



        let chart1  = new Chart(plotRef, config1);
    }).catch(console.error);
}


let cargarPrecipitacion = (arrJSONDatos) => {
    let datosPrecipitaciones = filtrar(arrJSONDatos);
    let mediciones = sacarPromedios(datosPrecipitaciones);

    let precipitacionMinValue = document.getElementById("precipitacionMinValue");
    let precipitacionPromValue = document.getElementById("precipitacionPromValue");
    let precipitacionMaxValue = document.getElementById("precipitacionMaxValue");

    precipitacionMinValue.textContent = `Min ${mediciones[0]} [mm]`;
    precipitacionPromValue.textContent = `Prom ${Math.round(mediciones[1]*100) / 100} [mm]`;
    precipitacionMaxValue.textContent = `Max ${mediciones[2]} [mm]`;
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

let cargarFechaActual = () => {
    let coleccionHTML = document.getElementsByTagName("h6");
    let tituloH6 = coleccionHTML[0];
    tituloH6.textContent = fechaActual();
}


cargarFechaActual();
cargarOpenMeteor();

