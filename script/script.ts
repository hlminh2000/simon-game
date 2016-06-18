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
      console.log(this.element.id);
   }
}

class GameState{
   public playerTurn:boolean;
   public isPlaying:boolean;
   public strictMode:boolean;
   public currentSequence:Array<string>;
   constructor(initialState:GameState){
      this.playerTurn = initialState.playerTurn;
      this.isPlaying = initialState.isPlaying;
      this.strictMode = initialState.strictMode;
   }
}

function loadGame(state: GameState, boxes:Array<StageBox>)
{
   // var delay:number = 10000;
   let delay = 2000;
   let timer = setTimeout(()=>{
      if(!state.isPlaying){
         return;
      }  else  {
         console.log(state);
      }
   }, delay);
   loadGame(state, boxes);
}

window.addEventListener('load', () => {
   let a_StageBox:Array<StageBox> = $$('stage-box').map((element:HTMLElement)=>{
      return new StageBox(element);
   });

   var gameState = new GameState({
      playerTurn      : false,
      isPlaying       : false,
      strictMode      : false,
      currentSequence : [],
   });

   $('strictModeToggle').addEventListener('click' , () => {
      gameState.strictMode = !gameState.strictMode;
      $('strictModeToggle').innerText = gameState.strictMode ? 'ON' : 'OFF';
   });

   $('startButton').addEventListener('click' , () => {
      gameState.isPlaying = !gameState.isPlaying;
      $('startButton-text').innerText = gameState.isPlaying ? 'STOP' : 'START';
      loadGame(gameState, a_StageBox);
   });

});
