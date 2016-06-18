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
        console.log(this.element.id);
    };
    return StageBox;
}());
var GameState = (function () {
    function GameState(initialState) {
        this.playerTurn = initialState.playerTurn;
        this.isPlaying = initialState.isPlaying;
        this.strictMode = initialState.strictMode;
    }
    return GameState;
}());
function loadGame(state, boxes) {
    var delay = 2000;
    var timer = setTimeout(function () {
        if (!state.isPlaying) {
            return;
        }
        else {
            console.log(state);
        }
    }, delay);
    loadGame(state, boxes);
}
window.addEventListener('load', function () {
    var a_StageBox = $$('stage-box').map(function (element) {
        return new StageBox(element);
    });
    var gameState = new GameState({
        playerTurn: false,
        isPlaying: false,
        strictMode: false,
        currentSequence: [],
    });
    $('strictModeToggle').addEventListener('click', function () {
        gameState.strictMode = !gameState.strictMode;
        $('strictModeToggle').innerText = gameState.strictMode ? 'ON' : 'OFF';
    });
    $('startButton').addEventListener('click', function () {
        gameState.isPlaying = !gameState.isPlaying;
        $('startButton-text').innerText = gameState.isPlaying ? 'STOP' : 'START';
        loadGame(gameState, a_StageBox);
    });
});
