var Turn;
(function (Turn) {
    Turn[Turn["PLAYER"] = 0] = "PLAYER";
    Turn[Turn["AI"] = 1] = "AI";
})(Turn || (Turn = {}));
var currentState;
const Options = [
    'triangle',
    'circle',
    'square',
    'x'
];
var soundMap = {
    'triangle': function () { return new Audio('../assets/sound/B3.mp3'); },
    'circle': function () { return new Audio('../assets/sound/C3.mp3'); },
    'square': function () { return new Audio('../assets/sound/E3.mp3'); },
    'x': function () { return new Audio('../assets/sound/G3.mp3'); }
};
var currentSession = {
    gameStates: [],
    userSignature: null
};
currentState = newGameState();
function startCycle(lastCyclePassed) {
    if (currentState.isPlaying) {
        if (lastCyclePassed) {
            addAiMove(getRandomOption());
        }
        playAiSequence()
            .then(startPlayerTurn)
            .then(function () {
            updateScore();
            return setDelay(listenToAnswer, 0);
        })
            .then(handlePlayerResponse)
            .then(function (_lastCyclePassed) {
            startCycle(_lastCyclePassed);
        });
    }
}
function stopCycle() {
    currentState = newGameState();
    updateScore();
}
function toggleStartStop() {
    if (currentState.isPlaying) {
        currentState.isPlaying = false;
        stopCycle();
    }
    else {
        currentState = newGameState();
        currentState.isPlaying = true;
        startCycle(true);
    }
    updateVisual();
}
function newGameState() {
    var state = {
        playerSequence: [],
        aiSequence: [],
        currentTurn: Turn.AI,
        strictMode: false,
        scoreHistory: [],
        isPlaying: false,
    };
    currentSession.gameStates.push(state);
    return state;
}
function getRandomOption() {
    return Options[Math.floor(Math.random() * (Options.length)) + 0];
}
function addAiMove(_moveOption) {
    var move = {
        option: _moveOption,
        moveIndex: currentState.aiSequence.length,
    };
    currentState.aiSequence.push(move);
}
function playAiSequence() {
    var promise = new Promise(function (resolve, reject) {
        currentState.aiSequence.forEach(function (move) {
            setTimeout(function () {
                if (currentState.isPlaying) {
                    playSoundById(move.option);
                    highlightElement(move.option);
                    if (currentState.aiSequence.indexOf(move) === (currentState.aiSequence.length - 1)) {
                        resolve(true);
                    }
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
    return new Promise(function (resolve, reject) {
        if (submissionCorrect) {
            console.log("good job");
            currentState.scoreHistory.push(currentState.aiSequence.length);
        }
        else {
            console.log("boo");
            if (currentState.strictMode) {
                clearAiSequence();
            }
        }
        updateScore();
        clearUserSequence();
        currentState.currentTurn = Turn.AI;
        if (!submissionCorrect) {
            feedbackWhenWrong()
                .then(function () {
                resolve(submissionCorrect);
            });
        }
        else {
            feedbackWhenCorrect()
                .then(function () {
                resolve(submissionCorrect);
            });
        }
    });
}
function feedbackWhenWrong() {
    return new Promise(function (resolve, reject) {
        var rotationCycle = 0;
        var interval = setInterval(function () {
            elId('stageBox').style.transform = 'rotate(' + (45 + Math.sin(rotationCycle / 20) * 5) + "deg)";
            rotationCycle++;
            if (rotationCycle >= 60 * Math.PI) {
                elId('stageBox').style.transform = 'rotate(45deg)';
                clearInterval(interval);
                resolve();
            }
        }, 10);
    });
}
function feedbackWhenCorrect() {
    return new Promise(function (resolve, reject) {
        Options.forEach(function (option) {
            elId(option).style.boxShadow = '0px 0px 28px 0px rgba(0,255,132,1);';
            setDelay(function () {
                return new Promise(function (res, rej) {
                    elId(option).style.boxShadow = 'none';
                    res();
                });
            }, 1000).then(function () {
                setTimeout(function () {
                    resolve();
                }, 500);
            });
        });
    });
}
function updateScore() {
    elId("countValue").innerHTML = String(currentState.aiSequence.length);
}
function toggleStrictMode() {
    if (!currentState.isPlaying) {
        currentState.strictMode = !currentState.strictMode;
        updateVisual();
    }
}
function updateVisual() {
    elId('strictModeToggler').innerHTML = currentState.strictMode ? "ON" : "OFF";
    elId('startButton-text').innerHTML = currentState.isPlaying ? "RESET" : "START";
    updateScore();
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
    }
    else {
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
        moveIndex: currentState.playerSequence.length,
    };
    if (currentState.playerSequence.length < currentState.aiSequence.length) {
        currentState.playerSequence.push(move);
    }
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
    var audio = soundMap[id]();
    audio.volume = 0.5;
    audio.play();
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
            callback().then(function (result) {
                resolve(result);
            });
        }, delay);
    });
}
function transmitSessionData() {
    var xhr = new XMLHttpRequest();
    var url = "/gameSession";
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.responseText);
        }
    };
    xhr.send(JSON.stringify(packageDataForTransmission(currentSession)));
}
function getLatestState() {
    var xhr = new XMLHttpRequest();
    var url = "/latestState";
    xhr.open('GET', url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.responseText);
            currentState = JSON.parse(xhr.responseText);
            updateVisual();
            if (currentState.isPlaying) {
                startCycle(true);
            }
        }
    };
    xhr.send(JSON.stringify(packageDataForTransmission(currentSession)));
}
function packageDataForTransmission(data) {
    return {
        timestamp: Date.now(),
        data: data
    };
}
