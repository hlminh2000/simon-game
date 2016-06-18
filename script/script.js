function $(id) {
    return document.getElementById(id);
}
function $$(className) {
    return Array.prototype.slice.call(document.getElementsByClassName(className));
}
var StageBox = (function () {
    function StageBox(element) {
        var _this = this;
        this.element = element;
        this.resetAudio();
        this.element.addEventListener('click', function () {
            _this.blink();
        });
        console.log(this.element.id);
    }
    StageBox.prototype.resetAudio = function () {
        if (this.audio != null) {
            delete this.audio;
        }
        this.audio = new Audio(this.element.id == 'x' ? '/assets/sound/C3.mp3'
            : this.element.id == 'square' ? '/assets/sound/E3.mp3'
                : this.element.id == 'circle' ? '/assets/sound/G3.mp3'
                    : this.element.id == 'triangle' ? '/assets/sound/B3.mp3'
                        : null);
    };
    StageBox.prototype.onClick = function () {
        this.blink();
    };
    StageBox.prototype.blink = function () {
        var _this = this;
        this.resetAudio();
        this.audio.play();
        this.element.classList.add('blinking');
        this.element.children[0].classList.add('blinking');
        setTimeout(function () {
            _this.element.classList.remove('blinking');
            _this.element.children[0].classList.remove('blinking');
        }, 400);
    };
    return StageBox;
}());
var BoxStage = (function () {
    function BoxStage(boxSet) {
        this.boxes = boxSet;
    }
    BoxStage.prototype.getBox = function (id) {
        return this.boxes.reduce(function (defalt, box) {
            return box.element.id == id ? box : null;
        });
    };
    return BoxStage;
}());
var GameState = (function () {
    function GameState(initialState) {
        this.isPlayerTurn = initialState.isPlayerTurn;
        this.isPlaying = initialState.isPlaying;
        this.strictMode = initialState.strictMode;
        this.currentSequence = initialState.currentSequence;
    }
    return GameState;
}());
function loadGame(state, stage) {
    var sequenceDelay = 1000;
    if (state.isPlaying) {
        var delay = sequenceDelay;
        state.currentSequence.forEach(function (id) {
            setTimeout(function () {
                stage.getBox(id).blink();
            }, delay);
            delay += sequenceDelay;
        });
        console.log(state.currentSequence);
    }
}
window.addEventListener('load', function () {
    var stage = new BoxStage($$('stage-box').map(function (element) {
        return new StageBox(element);
    }));
    var gameState = new GameState({
        isPlayerTurn: false,
        isPlaying: false,
        strictMode: false,
        currentSequence: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
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
