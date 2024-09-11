// Configurazione del test
const categories = {
    me: ["Io", "Mi", "Mio", "Me", "Miei"],
    others: ["Loro", "Loro", "Altri", "Altri", "Altri"],
    shame: ["Vergogna", "Imbarazzo", "Senso di colpa", "Disonore", "Disprezzo"],
    honor: ["Onore", "Rispetto", "Stima", "Orgoglio", "Decoro"]
};

const blockConfig = {
    practiceBlocks: 1,
    testBlocks: 2,
    trialsPerBlock: 20,
    testTrialsPerBlock: 40
};

let currentBlock = 0;
let currentTrial = 0;
let startTime = null;
let responses = [];
let stimuli = [];
let isPractice = true;

// Mischia gli elementi di un array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Genera stimoli casuali per il test
function generateStimuli() {
    stimuli = [];
    const categoriesArray = Object.keys(categories);
    categoriesArray.forEach(cat => {
        const items = categories[cat];
        items.forEach(item => {
            stimuli.push({ text: item, category: cat });
        });
    });
    shuffleArray(stimuli);
}

// Mostra le istruzioni iniziali
function showInstructions() {
    document.getElementById("instruction").style.display = "block";
    document.getElementById("experiment").style.display = "none";
    document.getElementById("instruction-text").textContent = "Premi qualsiasi tasto per iniziare il test.";
}

// Inizia il test
function startTest() {
    document.getElementById("instruction").style.display = "none";
    document.getElementById("experiment").style.display = "block";
    generateStimuli();
    currentBlock = 1;
    currentTrial = 0;
    showStimulus();
}

// Mostra lo stimolo attuale
function showStimulus() {
    if (currentTrial < (isPractice ? blockConfig.trialsPerBlock : blockConfig.testTrialsPerBlock)) {
        let stimulus = stimuli[currentTrial % stimuli.length];
        document.getElementById("stimulus").textContent = stimulus.text;
        startTime = Date.now();
    } else {
        endBlock();
    }
}

// Gestisci la risposta dell'utente
function handleResponse(key) {
    const responseTime = Date.now() - startTime;
    const stimulus = stimuli[currentTrial % stimuli.length];
    responses.push({
        timestamp: new Date().toISOString(),
        stimulus: stimulus.text,
        category: stimulus.category,
        key: key,
        responseTime: responseTime
    });
    currentTrial++;
    showStimulus();
}

// Termina il blocco e passa al successivo
function endBlock() {
    if (currentBlock < (blockConfig.practiceBlocks + blockConfig.testBlocks)) {
        currentBlock++;
        currentTrial = 0;
        isPractice = (currentBlock <= blockConfig.practiceBlocks);
        generateStimuli();
        showStimulus();
    } else {
        endTest();
    }
}

// Termina il test e invia i dati
function endTest() {
    document.getElementById("experiment").style.display = "none";
    document.getElementById("instruction").style.display = "block";
    document.getElementById("instruction-text").textContent = "Test completato! Grazie per aver partecipato.";
    console.log(responses);
    sendDataToSheet();
}

// Invia i dati al foglio Google
function sendDataToSheet() {
    const sheetId = 'YOUR_SHEET_ID'; // Inserisci l'ID del tuo foglio Google
    const apiKey = 'YOUR_API_KEY'; // Inserisci la tua chiave API
    const sheetName = 'Sheet1'; // Inserisci il nome del foglio

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED&key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            range: `${sheetName}!A1`,
            majorDimension: 'ROWS',
            values: responses.map(response => [
                response.timestamp,
                response.stimulus,
                response.category,
                response.key,
                response.responseTime
            ]),
        }),
    })
    .then(response => response.json())
    .then(data => console.log('Data sent successfully:', data))
    .catch((error) => console.error('Error sending data:', error));
}

// Ascolta le risposte dell'utente
document.addEventListener("keydown", function(event) {
    if (event.key === "E" || event.key === "I") {
        handleResponse(event.key);
    }
});

// Avvia il test quando l'utente preme un tasto
document.addEventListener("keydown", function(event) {
    if (!document.getElementById("experiment").style.display) {
        startTest();
    }
});

// Mostra le istruzioni iniziali
showInstructions();
