var sentimentChart = new Chart(document.getElementById("myChart"), {
    type: 'line',
    data: {
        labels: [1,2,3,4,5,6,7,8,9,10],
        datasets: [{ 
            data: [],
            label: "Positive",
            borderColor: "green",
            fill: false
        }, { 
            data: [282,350,411,502,635,809,947,1402,3700,5267],
            label: "Negative",
            borderColor: "red",
            fill: false
        }, { 
            data: [168,170,178,190,203,276,408,547,675,734],
            label: "Neutral",
            borderColor: "blue",
            fill: false
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Sentiment Analysis'
        }
    }
});
function checkSentiment(){
    sentimentChart.data.datasets[0].data.push(1000);
    sentimentChart.update();
}

function brodenScope(){
    sentimentChart.data.labels.push(11);
    sentimentChart.update();
}