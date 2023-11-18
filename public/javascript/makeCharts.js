let chart1 = null;
let chart2 = null;
let chart3 = null;
let arrChart = [chart1, chart2, chart3];

let validarChart = () => {
    for(let i in arrChart){
        if(arrChart[i] != null){
            arrChart[i].destroy();
        }
    }
}

let makeLineChart = (data, indice, plot, labels,title) => {
    let plotRef = document.getElementById(plot);
    let config = {
        type: 'line',
            data: {
              labels: labels, 
              datasets: [
                {
                  label: title,
                  data: data,
                  fill: true, 
                }
              ]
            },
            options: {
                responsive: true
            },
    }

    arrChart[indice] = new Chart(plotRef, config);
}

let makeBarChart = (data, indice, plot,labels, title) => {
    let plotRef = document.getElementById(plot);
    let config = {
        type: 'bar',
            data: {
              labels: labels, 
              datasets: [
                {
                  label: title,
                  data: data,
                  borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
                  ],
                  borderWidth: 3,
                  backgroundColor: ['rgba(255, 99, 132, 0.2)',
                  'rgba(255, 159, 64, 0.2)',
                  'rgba(255, 205, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(201, 203, 207, 0.2)'
                ] 
                }
              ]
            },
            options: {
                responsive: true
            }
    }

    arrChart[indice] = new Chart(plotRef, config);
}

export{validarChart, makeBarChart, makeLineChart};