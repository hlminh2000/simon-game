function $(id:string){
   return document.getElementById(id);
}

function $$(className:string){
   return Array.prototype.slice.call(document.getElementsByClassName(className));
}

class StageBox{
   element:HTMLElement;
   audio:HTMLAudioElement;

   constructor(element:HTMLElement){
      this.element = element;
      this.resetAudio();
      this.element.addEventListener('click', ()=>{
         this.blink();
      });
      console.log(this.element.id);
   }
   resetAudio(){
      if(this.audio != null){
         delete this.audio;
      }
      this.audio = new Audio(
         this.element.id == 'x' ? '/assets/sound/C3.mp3'
            : this.element.id == 'square' ? '/assets/sound/E3.mp3'
               : this.element.id == 'circle' ? '/assets/sound/G3.mp3'
                  : this.element.id == 'triangle' ? '/assets/sound/B3.mp3'
                     : null
      );
   }
   onClick(){
      this.blink();
   }
   blink(){
      this.resetAudio();
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
      return this.boxes.reduce((defalt:StageBox, box:StageBox)=>{
         return box.element.id == id ? box : null;
      });
   }
}

class GameState{
   public isPlayerTurn:boolean;
   public isPlaying:boolean;
   public strictMode:boolean;
   public currentSequence:Array<string>;
   constructor(initialState:GameState){
      this.isPlayerTurn = initialState.isPlayerTurn;
      this.isPlaying = initialState.isPlaying;
      this.strictMode = initialState.strictMode;
      this.currentSequence = initialState.currentSequence;
   }
}

function loadGame(state: GameState, stage:BoxStage):void{
   let sequenceDelay:number = 1000;
   if(state.isPlaying){
      var delay:number = sequenceDelay;
      state.currentSequence.forEach((id:string) => {
         setTimeout(()=>{
            stage.getBox(id).blink();
         },delay);
         delay+=sequenceDelay;
      });
      console.log(state.currentSequence);
      // var newBoxIndex = Math.floor(Math.random() * stage.boxes.length) + 0;
      // stage.boxes[newBoxIndex].blink();
      // state.currentSequence.push(stage.boxes[newBoxIndex].element.id);
   }
}

window.addEventListener('load', () => {

   var stage:BoxStage = new BoxStage(
      $$('stage-box').map((element)=>{
         return new StageBox(element);
      })
   );

   var gameState = new GameState({
      isPlayerTurn      : false,
      isPlaying       : false,
      strictMode      : false,
      currentSequence : ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
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
