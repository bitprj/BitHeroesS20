const analyseFunctionUrl = "https://political-leaning-article.azurewebsites.net/api/HttpTrigger"
const searchFunctionUrl = "https://political-leaning-article.azurewebsites.net/api/HttpTrigger1"

var analysisChart = new Chart(document.getElementById('analysisChart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{ 
            data: [],
            label: "Positive",
            borderColor: "green",
            fill: false
        }, { 
            data: [],
            label: "Negative",
            borderColor: "red",
            fill: false
        }, { 
            data: [],
            label: "Neutral",
            borderColor: "blue",
            fill: false
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Sentiment Analysis'
        }, 
    }
});

var counter = 0;
var continueRunning = true;

var positiveTotal = 0;
var negativeTotal = 0;
var neutralTotal = 0;

var aslTotal = 0;
var aswTotal = 0;
var scoreTotal = 0;

var leaningTotal = 0;
var leaningCurrent = 0;

var keyPhraseArray = [];

var typeArray = ["sentiment", "difficulty", "leaning"];
var typeIndex = 0;

var searchIndicator = 0;

var analyticsButton = document.getElementById("analyticsButton").addEventListener("click", getCurrentUrl);
var switchButton = document.getElementById("switchButton").addEventListener("click", switchAnalysis);
var searchButton = document.getElementById("searchButton").addEventListener("click", switchSearch);

function switchSearch() {
    if (searchIndicator == 1) {
        searchIndicator = 0
        document.getElementById("search").innerHTML = " "
    } else if (searchIndicator == 0) {
        searchIndicator = 1
        document.getElementById("search").innerHTML = " * "
    }
}

function resetValues() {
    counter = 0;
    continueRunning = true;

    positiveTotal = 0;
    negativeTotal = 0;
    neutralTotal = 0;

    aslTotal = 0;
    aswTotal = 0;
    scoreTotal = 0;

    leaningTotal = 0;
    leaningCurrent = 0;

    analysisChart.data.labels = [];
    analysisChart.data.datasets[0].data = [];
    analysisChart.data.datasets[1].data = [];
    analysisChart.data.datasets[2].data = [];


    analysisChart.update();
}

function switchAnalysis() {
    updateTypeIndex();
    if (typeArray[typeIndex].localeCompare("sentiment") == 0) {
        switchToSentiment();
    } else if (typeArray[typeIndex].localeCompare("difficulty") == 0) {
        switchToDifficulty();
    } else if (typeArray[typeIndex].localeCompare("leaning") == 0) {
        switchToLeaning();
    }
}

function updateTypeIndex() {
    var typeLength = typeArray.length;
    typeIndex++;
    if (typeIndex == typeLength){
        typeIndex = 0;
    }
}

function switchToSentiment() {
    analysisChart.data.datasets[0].label = "Positve";
    analysisChart.data.datasets[1].label = "Negative";
    analysisChart.data.datasets[2].label = "Neutral";
    analysisChart.options.title.text = 'Sentiment Analysis';
    document.querySelector('#analyticsButton').innerText = 'Check Sentiment!';
    resetValues();
}
// change structure in the future to be more object orientated, too rigid rn
function switchToDifficulty() {
    analysisChart.data.datasets[0].label = "ASL";
    analysisChart.data.datasets[1].label = "ASW";
    analysisChart.data.datasets[2].label = "Difficulty Score";
    analysisChart.options.title.text = 'Text Difficulty Analysis';
    document.querySelector('#analyticsButton').innerText = 'Check Difficulty!';
    resetValues();
}

function switchToLeaning() {
    analysisChart.data.datasets[0].label = "Average Leaning";
    analysisChart.data.datasets[1].label = "Section Leaning";
    analysisChart.data.datasets[2].label = "";
    // analysisChart.data.datasets[2].pop(); // make sure this doesnt break the entire program

    // analysisChart.data = {
    //     labels: [],
    //     datasets: [{ 
    //         data: [],
    //         label: "Average Leaning",
    //         borderColor: "green",
    //         fill: false
    //     }, { 
    //         data: [],
    //         label: "Section Leaning",
    //         borderColor: "red",
    //         fill: false
    //     }]
    // }
    analysisChart.options.title.text = 'Political Leaning Analysis';
    document.querySelector('#analyticsButton').innerText = 'Check Leaning!';
    resetValues();
}

function getCurrentUrl() {
    resetValues();
    var url = document.getElementById('urlPlaceholder').value;
    analyseFunction(url, typeArray[typeIndex]);
    // chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    //     let url = tabs[0].url;
    //     analyseFunction(url, type);
    // }); 

    // use for extension
    
}

async function analyseFunction(url, type){
    console.log("pressed")
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    var currentUrl = "?name=".concat(url);
    var phrases = "&phrases=".concat(searchIndicator);
    var analysis = "&analysis=".concat(type);

    while (continueRunning){
        var cycle = "&cycle=".concat(counter);
        const response = await fetch(proxyurl + analyseFunctionUrl + currentUrl + phrases + analysis + cycle);
        const jsonData = await response.json();

        // figure out how to deal with bug - when extension runs on chrome://extensions, returns empty json 
        // just add as a feature for both rn, in future change to be its own page
        if (!jsonData.continue) {
            continueRunning = false;
        } else if (type.localeCompare("sentiment") == 0) {
            counter++;
            updateSentimentData(jsonData);
            updateSentimentChart(counter);

            if (searchIndicator == 1) {
                updateKeyPhraseArray(jsonData); //
            }
        } else if (type.localeCompare("difficulty") == 0) {
            counter++;
            updateDifficultyData(jsonData);
            updateDifficultyChart(counter);

            if (searchIndicator == 1) {
                updateKeyPhraseArray(jsonData); //
            }
        } else if (type.localeCompare("leaning") == 0) {
            counter++;
            updateLeaningData(jsonData);
            updateLeaningChart(counter);

            if (searchIndicator == 1) {
                updateKeyPhraseArray(jsonData); //
            }
        } else {
            continueRunning = false;
        }
    }
    giveResults(type, counter);
    if (searchIndicator == 1) {
        searchFunction(url)
    }
}

function updateSentimentChart(counter) {
    analysisChart.data.labels.push(counter);

    analysisChart.data.datasets[0].data.push(positiveTotal/counter);
    analysisChart.data.datasets[1].data.push(negativeTotal/counter);
    analysisChart.data.datasets[2].data.push(neutralTotal/counter);

    analysisChart.update();
}

function updateSentimentData(jsonData) {
    positiveTotal += jsonData.value.positive;
    negativeTotal += jsonData.value.negative;
    neutralTotal += jsonData.value.neutral;
}

function updateDifficultyChart(counter) {
    analysisChart.data.labels.push(counter);
    analysisChart.data.datasets[0].data.push(aslTotal/counter);
    analysisChart.data.datasets[1].data.push(aswTotal/counter);
    analysisChart.data.datasets[2].data.push(scoreTotal/counter);

    analysisChart.update();
}

function updateDifficultyData(jsonData) { 
    scoreTotal += jsonData.value.flesch_reading_score;
    aslTotal += (jsonData.value.asl * 1.015);
    aswTotal += (jsonData.value.asw * 84.6);
}

function updateLeaningChart(counter) {
    analysisChart.data.labels.push(counter);
    analysisChart.data.datasets[0].data.push(leaningTotal/counter);
    analysisChart.data.datasets[1].data.push(leaningCurrent);

    analysisChart.update();
}

function updateLeaningData(jsonData) {
    leaningTotal += jsonData.value.score
    leaningCurrent = jsonData.value.score
}

function updateKeyPhraseArray(jsonData) {
    var keyPhrases = jsonData.phrases;
    keyPhraseArray.push(keyPhrases)
}

async function searchFunction(url) {
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    var phrasesString = keyPhraseArray.join(" "); 

    var phrases = "?phrases=".concat(phrasesString);
    var currentUrl = "&url=".concat(url);
    //add counter feature afterwards
    const response = await fetch(proxyurl + searchFunctionUrl + phrases + currentUrl);
    const jsonData = await response.json();

    var articleName = jsonData.site[0].name
    var articleDescription = jsonData.site[0].description
    var articleUrl = jsonData.site[0].url

    const article = "Article Title: ".concat(articleName).concat("\nDescription: ").concat(articleDescription).concat("\nLink: ").concat(articleUrl)
    // document.getElementById("search").innerHTML = " * Article Title: ".concat(articleName)
    // .concat("\nDescription: ").concat(articleDescription)
    // .concat("\nURL: ").concat(articleUrl)
    window.alert(article)
}

function giveResults(type, counter){
    if (type.localeCompare("sentiment") == 0){
        updateSentimentChart(counter);
        document.getElementById("p").innerHTML = "Final Result: ".concat(getSentiment());
    } else if (type.localeCompare("difficulty") == 0){
        updateDifficultyChart(counter);
        document.getElementById("p").innerHTML = "Final Result: ".concat(getDifficulty());
    } else if (type.localeCompare("leaning") == 0){
        updateLeaningChart(counter);
        document.getElementById("p").innerHTML = "Final Result: ".concat(getLeaning(counter));
    }
}

function getSentiment() {
    if (checkForMixed()) {
        return "Mixed"
    } else if (positiveTotal > negativeTotal && positiveTotal > neutralTotal) {
        return "Positive"
    } else if (negativeTotal > positiveTotal && negativeTotal > neutralTotal) {
        return "Negative"
    } else {
        return "Neutral"
    }
}

function checkForMixed() {
    var count = counter;
    return (positiveTotal/count < 0.40) && (neutralTotal/count < 0.40) && (negativeTotal/count < 0.40)
}

function getDifficulty() {
    var count = counter + 1;
    var rating = scoreTotal/count
    if (rating > 90) {
        return "Very Easy"
    } else if (rating > 70) {
        return "Easy"
    } else if (rating > 50) {
        return "Average"
    } else if (rating > 30) {
        return "Difficult"
    } else {
        return "Very Difficult"
    }
}

function getLeaning(counter) {
    resultString = ""
    averageLeaning = leaningTotal/counter
    if ((14 < averageLeaning) && (averageLeaning < 21)) {
        return "Conservative"
    } else if ((-14 > averageLeaning) && (averageLeaning > -21)) {
        return "Liberal"
    } else if ((-7 < averageLeaning) && (averageLeaning < 7)) {
        return "Moderate"
    }
    
    if (Math.abs(averageLeaning) > 35) {
        resultString.concat("Extremely ")
    } else if (Math.abs(averageLeaning) > 21) {
        resultString.concat("Somewhat ")
    } 
    
    if (Math.abs(averageLeaning) > 28) {
        resultString.concat("Radically ")
    } else if (Math.abs(averageLeaning) > 7) {
        resultString.concat("Moderately ")
    } 

    if (Math.abs(averageLeaning) > 0) {
        resultString.concat("Right")
        return resultString
    } else {
        resultString.concat("Left")
        return resultString
    }
}

// integrate search into new azure function, return links
// integrate feature which allows you to get more keywords, do this by creating optional param which gives you number of periods per sentences, add to anaylsis string
// handle edge case by adding url name, this will ensure no repeats of articles
// rename url varibles to a more appropriate name
// figure out where the google extension bug is
// add to backend key word to json function
// add function to call new azure function to return webpages
// reorganize every doc
// add function to limit description to x lines, then do the ...
// add param to backend to only excecute needed resources, so difficulty during difficulty, etc.
// manually adopt the incremental increase pacing
// offer optional param to increase increments of text size requests
// video to text integration
// organize project by creating multiple files
// change it so that it becomes a parallel excecution, calls functions multiple times per second
// google extension, get cookies for data for anaylsis over time
// twilio capabilites
// if time permits, change files to be object orientated friendly
// personal project, adopt the sudoku board into a google extension, create the backend and stuff
// update color pallete + logo
// handle edge case for empty string for new azure function