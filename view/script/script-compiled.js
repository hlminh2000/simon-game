var Turn;
(function (Turn) {
    Turn[Turn["PLAYER"] = 0] = "PLAYER";
    Turn[Turn["AI"] = 1] = "AI";
})(Turn || (Turn = {}));
var currentState;
const Options = ['triangle', 'circle', 'square', 'x'];
var soundMap = {
    'triangle': function () {
        return new Audio('../assets/sound/B3.mp3');
    },
    'circle': function () {
        return new Audio('../assets/sound/C3.mp3');
    },
    'square': function () {
        return new Audio('../assets/sound/E3.mp3');
    },
    'x': function () {
        return new Audio('../assets/sound/G3.mp3');
    }
};
function startGame() {
    if (!currentState) {
        currentState = newGameState();
    }
    var randomOption = getRandomOption();
    addAiMove(randomOption);
    playAiSequence().then(startPlayerTurn).then(function () {
        return setDelay(listenToAnswer, 2000);
    }).then(handlePlayerResponse);
}
function newGameState() {
    return {
        playerSequence: [],
        aiSequence: [],
        currentTurn: Turn.AI,
        strictMode: false,
        scoreHistory: []
    };
}
function getRandomOption() {
    return Options[Math.floor(Math.random() * (Options.length - 1)) + 0];
}
function addAiMove(_moveOption) {
    var move = {
        option: _moveOption,
        moveIndex: currentState.aiSequence.length
    };
    currentState.aiSequence.push(move);
}
function playAiSequence() {
    var promise = new Promise(function (resolve, reject) {
        currentState.aiSequence.forEach(function (move) {
            setTimeout(function () {
                playSoundById(move.option);
                highlightElement(move.option);
                if (currentState.aiSequence.indexOf(move) === currentState.aiSequence.length - 1) {
                    resolve(true);
                }
            }, currentState.aiSequence.indexOf(move) * 1500);
        });
    });
    return promise;
}
function startPlayerTurn() {
    return new Promise(function (resolve, reject) {
        currentState.currentTurn = Turn.PLAYER;
        var playerTurnEnded = false;
        resolve(true);
    });
}
function listenToAnswer() {
    return new Promise(function (resolve, reject) {
        var interval = setInterval(function () {
            console.log(playerPickedWrongOption());
            if (playerCompletedTurn() || playerPickedWrongOption()) {
                clearInterval(interval);
                resolve(!playerPickedWrongOption());
            }
        }, 200);
    });
}
function handlePlayerResponse(submissionCorrect) {
    if (submissionCorrect) {
        console.log("good job");
        currentState.scoreHistory.push(currentState.aiSequence.length);
    } else {
        console.log("boo");
        if (currentState.strictMode) {
            clearAiSequence();
        }
    }
    updateScore();
    clearUserSequence();
    currentState.currentTurn = Turn.AI;
    setTimeout(startGame, 2500);
}
function updateScore() {
    elId("countValue").innerHTML = String(currentState.aiSequence.length);
}
function toggleStrictMode() {
    currentState.strictMode = !currentState.strictMode;
}
function getHighScore() {
    return currentState.scoreHistory.reduce(function (max, score) {
        return score > max ? score : max;
    }, 0);
}
function clearUserSequence() {
    currentState.playerSequence = [];
}
function clearAiSequence() {
    currentState.aiSequence = [];
}
function playerPickedWrongOption() {
    if (currentState.playerSequence.length == 0) {
        return false;
    } else {
        return !(currentState.playerSequence.filter(function (move) {
            return move.option == currentState.aiSequence[move.moveIndex].option;
        }).length == currentState.playerSequence.length);
    }
}
function playerCompletedTurn() {
    return currentState.playerSequence.length >= currentState.aiSequence.length;
}
function addPlayerMove(_moveOption) {
    var move = {
        option: _moveOption,
        moveIndex: currentState.playerSequence.length
    };
    currentState.playerSequence.push(move);
}
function elId(id) {
    return document.getElementById(id);
}
function elsClass(className) {
    return Array.prototype.slice.call(document.getElementsByClassName(className));
}
function log(arg) {
    return console.log(arg);
}
function onBoxClick(id) {
    if (currentState.currentTurn === Turn.PLAYER) {
        playSoundById(id);
        highlightElement(id);
        addPlayerMove(id);
    }
}
function playSoundById(id) {
    soundMap[id]().play();
}
function highlightElement(id) {
    elId(id).className += " blinking";
    setTimeout(function () {
        var className = elId(id).className.split(' ');
        className.pop();
        elId(id).className = className.join(' ');
    }, 700);
}
function setDelay(callback, delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            callback().then(function () {
                resolve(true);
            });
        }, delay);
    });
}
