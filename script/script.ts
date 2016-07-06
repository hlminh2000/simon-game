function $(id:string){
   return document.getElementById(id);
}

function $$(className:string){
   return Array.prototype.slice.call(document.getElementsByClassName(className));
}

class StageBox{
   element:HTMLElement;
   audio:HTMLAudioElement;
   audioSrc:string;
   self:StageBox;
   stage:BoxStage;

   constructor(element:HTMLElement){
      this.element = element;
      this.audioSrc = this.element.id == 'x' ? '/assets/sound/C3.mp3'
         : this.element.id == 'square'       ? '/assets/sound/E3.mp3'
         : this.element.id == 'circle'       ? '/assets/sound/G3.mp3'
         : this.element.id == 'triangle'     ? '/assets/sound/B3.mp3'
         : null;
      this.audio = new Audio(this.audioSrc);
      this.self = this;
   }
   enable(){
      this.element.addEventListener('click', ()=>{this.onClick()});
   }
   disable(){
      this.element.removeEventListener('click', ()=>{this.onClick()});
   }
   onClick(){
      this.blink();
   }
   blink(){
      delete this.audio;
      this.audio = new Audio(this.audioSrc);
      this.audio.play();
      this.element.classList.add('blinking');
      this.element.children[0].classList.add('blinking');
      setTimeout(()=>{
         this.element.classList.remove('blinking');
         this.element.children[0].classList.remove('blinking');
      }, 400);
   }
}

class BoxStage{
   boxes:Array<StageBox>;
   constructor(boxSet:Array<StageBox>){
      this.boxes = boxSet;
   }
   getBox(id:string):StageBox{
      return this.boxes.filter((box:StageBox)=>{
         return box.element.id == id;
      })[0];
   }
}

class GameState{
   public isPlayerTurn:boolean;
   public isPlaying:boolean;
   public strictMode:boolean;
   public currentSequence:Array<string>;
   public answerSequence:Array<string>;
   public currentTimers:Array<number>;
   constructor(initialState:GameState){
      this.isPlayerTurn = initialState.isPlayerTurn;
      this.isPlaying = initialState.isPlaying;
      this.strictMode = initialState.strictMode;
      this.currentSequence = initialState.currentSequence;
      this.currentTimers = initialState.currentTimers;
      this.answerSequence = initialState.answerSequence;
   }
}

function loadGame(state: GameState, stage:BoxStage):void{
   let sequenceDelay:number = 1000;
   if(state.isPlaying){
      if(!state.isPlayerTurn){
         var newBoxIndex = Math.floor(Math.random() * stage.boxes.length) + 0;
         state.currentSequence.push(stage.boxes[newBoxIndex].element.id);
         var delay:number = sequenceDelay;
         state.currentSequence.forEach((id:string, index:number, sequence:Array<string>) => {
            var timer =  setTimeout(()=>{
               stage.getBox(id).blink();
               clearTimeout(timer);
               state.currentTimers.pop();
            },delay);
            delay+=sequenceDelay;
         });
         state.isPlayerTurn = true;
         setTimeout(()=>{
            loadGame(state, stage);
         }, sequenceDelay * state.currentSequence.length);
      } else {
         getAnswer(state, stage).then((isCorrect:Boolean)=>{
            stage.boxes.forEach(box => box.disable());
            state.isPlayerTurn = false;
            var timer =  setTimeout(()=>{
               loadGame(state, stage);
            },sequenceDelay*2);
         });
      }
   } else {
      state.currentTimers.forEach((timer)=>{clearTimeout(timer)});
      return;
   }
}

function getAnswer(state:GameState, stage:BoxStage){
   var correctnessSequence:Array<Boolean> = [];
   var keyCounter:number = 0;
   return new Promise((resolve, reject)=>{
      stage.boxes.forEach((box:StageBox) => {
         box.enable();
         box.element.addEventListener('click', function onClick(e:MouseEvent){
            correctnessSequence.push(box.element.id === state.currentSequence[keyCounter]);
            if(correctnessSequence.length == state.currentSequence.length){
               box.element.removeEventListener('click', onClick);
               if(correctnessSequence.filter(isCorrect => isCorrect).length == correctnessSequence.length){
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

function isSelectionCorrect(box:StageBox, state:GameState, stage:BoxStage):Boolean
{
   return state.answerSequence
      .filter((id:string, index:number) => { return id == state.currentSequence[index];})
      .length == state.answerSequence.length;
}






window.addEventListener('load', () => {

   var stopGame:Event = new Event('stop');

   var stage:BoxStage = new BoxStage(
      $$('stage-box').map((element)=>{
         return new StageBox(element);
      })
   );

   // stage.boxes.forEach(box => box.enable());

   var gameState = new GameState({
      isPlayerTurn    : false,
      isPlaying       : false,
      strictMode      : false,
      currentSequence : [],
      currentTimers   : [],
      answerSequence  : [],
   });

   $('strictModeToggle').addEventListener('click' , () => {
      gameState.strictMode = !gameState.strictMode;
      $('strictModeToggle').innerText = gameState.strictMode ? 'ON' : 'OFF';
   });

   $('startButton').addEventListener('click' , () => {
      gameState.isPlaying = !gameState.isPlaying;
      $('startButton-text').innerText = gameState.isPlaying ? 'STOP' : 'START';
      loadGame(gameState, stage);
   });

});
