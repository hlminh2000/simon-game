'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function $(id) {
    return document.getElementById(id);
}
function $$(className) {
    return Array.prototype.slice.call(document.getElementsByClassName(className));
}

var StageBox = function () {
    function StageBox(element) {
        _classCallCheck(this, StageBox);

        this.element = element;
        this.audioSrc = this.element.id == 'x' ? '/assets/sound/C3.mp3' : this.element.id == 'square' ? '/assets/sound/E3.mp3' : this.element.id == 'circle' ? '/assets/sound/G3.mp3' : this.element.id == 'triangle' ? '/assets/sound/B3.mp3' : null;
        this.audio = new Audio(this.audioSrc);
        this.self = this;
    }

    _createClass(StageBox, [{
        key: 'enable',
        value: function enable() {
            var _this = this;

            this.element.addEventListener('click', function () {
                _this.onClick();
            });
        }
    }, {
        key: 'disable',
        value: function disable() {
            var _this2 = this;

            this.element.removeEventListener('click', function () {
                _this2.onClick();
            });
        }
    }, {
        key: 'onClick',
        value: function onClick() {
            this.blink();
        }
    }, {
        key: 'blink',
        value: function blink() {
            var _this3 = this;

            delete this.audio;
            this.audio = new Audio(this.audioSrc);
            this.audio.play();
            this.element.classList.add('blinking');
            this.element.children[0].classList.add('blinking');
            setTimeout(function () {
                _this3.element.classList.remove('blinking');
                _this3.element.children[0].classList.remove('blinking');
            }, 400);
        }
    }]);

    return StageBox;
}();

var BoxStage = function () {
    function BoxStage(boxSet) {
        _classCallCheck(this, BoxStage);

        this.boxes = boxSet;
    }

    _createClass(BoxStage, [{
        key: 'getBox',
        value: function getBox(id) {
            return this.boxes.filter(function (box) {
                return box.element.id == id;
            })[0];
        }
    }]);

    return BoxStage;
}();

var GameState = function GameState(initialState) {
    _classCallCheck(this, GameState);

    this.isPlayerTurn = initialState.isPlayerTurn;
    this.isPlaying = initialState.isPlaying;
    this.strictMode = initialState.strictMode;
    this.currentSequence = initialState.currentSequence;
    this.currentTimers = initialState.currentTimers;
    this.answerSequence = initialState.answerSequence;
};

function loadGame(state, stage) {
    var sequenceDelay = 1000;
    if (state.isPlaying) {
        if (!state.isPlayerTurn) {
            var newBoxIndex = Math.floor(Math.random() * stage.boxes.length) + 0;
            state.currentSequence.push(stage.boxes[newBoxIndex].element.id);
            var delay = sequenceDelay;
            state.currentSequence.forEach(function (id, index, sequence) {
                var timer = setTimeout(function () {
                    stage.getBox(id).blink();
                    clearTimeout(timer);
                    state.currentTimers.pop();
                }, delay);
                delay += sequenceDelay;
            });
            state.isPlayerTurn = true;
            setTimeout(function () {
                loadGame(state, stage);
            }, sequenceDelay * state.currentSequence.length);
        } else {
            getAnswer(state, stage).then(function (isCorrect) {
                stage.boxes.forEach(function (box) {
                    return box.disable();
                });
                state.isPlayerTurn = false;
                var timer = setTimeout(function () {
                    loadGame(state, stage);
                }, sequenceDelay * 2);
            });
        }
    } else {
        state.currentTimers.forEach(function (timer) {
            clearTimeout(timer);
        });
        return;
    }
}
function getAnswer(state, stage) {
    var correctnessSequence = [];
    var keyCounter = 0;
    return new Promise(function (resolve, reject) {
        stage.boxes.forEach(function (box) {
            box.enable();
            box.element.addEventListener('click', function onClick(e) {
                correctnessSequence.push(box.element.id === state.currentSequence[keyCounter]);
                if (correctnessSequence.length == state.currentSequence.length) {
                    box.element.removeEventListener('click', onClick);
                    if (correctnessSequence.filter(function (isCorrect) {
                        return isCorrect;
                    }).length == correctnessSequence.length) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
                keyCounter++;
            });
        });
    });
}
function isSelectionCorrect(box, state, stage) {
    return state.answerSequence.filter(function (id, index) {
        return id == state.currentSequence[index];
    }).length == state.answerSequence.length;
}
window.addEventListener('load', function () {
    var stopGame = new Event('stop');
    var stage = new BoxStage($$('stage-box').map(function (element) {
        return new StageBox(element);
    }));
    var gameState = new GameState({
        isPlayerTurn: false,
        isPlaying: false,
        strictMode: false,
        currentSequence: [],
        currentTimers: [],
        answerSequence: []
    });
    $('strictModeToggle').addEventListener('click', function () {
        gameState.strictMode = !gameState.strictMode;
        $('strictModeToggle').innerText = gameState.strictMode ? 'ON' : 'OFF';
    });
    $('startButton').addEventListener('click', function () {
        gameState.isPlaying = !gameState.isPlaying;
        $('startButton-text').innerText = gameState.isPlaying ? 'STOP' : 'START';
        loadGame(gameState, stage);
    });
});
