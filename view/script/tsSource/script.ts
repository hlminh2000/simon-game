// --- TYPE DEFINITIONS ---
enum Turn {
   PLAYER,
   AI
}

interface Move {
   option   :  string,
   moveIndex:  number
}

interface GameState {
   playerSequence    : Array<Move>;
   aiSequence        : Array<Move>;
   currentTurn       : Turn;
   strictMode        : boolean;
   scoreHistory      : Array<number>;
   isPlaying         : boolean;
}

interface SessionData {
   gameStates     :  Array<GameState>;
   userSignature  :  string;
}
// ------------------------


// --- GLOBAL VARIABLES ---
var currentState:GameState;
const Options:Array<string> = [
   'triangle',
   'circle',
   'square',
   'x'
];
var soundMap = {
   'triangle'  : function(){ return new Audio('../assets/sound/B3.mp3')},
   'circle'    : function(){ return new Audio('../assets/sound/C3.mp3')},
   'square'    : function(){ return new Audio('../assets/sound/E3.mp3')},
   'x'         : function(){ return new Audio('../assets/sound/G3.mp3')}
};
var currentSession:SessionData = {
   gameStates : [],
   userSignature : null
};

// --- FUNCTIONS ---
currentState = newGameState();
function startCycle(lastCyclePassed:boolean){
   if(currentState.isPlaying){
      if(lastCyclePassed){
         addAiMove(getRandomOption());
      }
      playAiSequence()
      .then(startPlayerTurn)
      .then(function(){
         updateScore();
         return setDelay(listenToAnswer, 0);
      })
      .then(handlePlayerResponse)
      .then(function(_lastCyclePassed){
         startCycle(_lastCyclePassed);
      });
   }
}

function stopCycle(){
   currentState = newGameState();
   updateScore();
}

function toggleStartStop(){
   if(currentState.isPlaying){
      currentState.isPlaying = false;
      stopCycle();
   } else {
      currentState = newGameState();
      currentState.isPlaying = true;
      startCycle(true);
   }
   updateVisual();
}

function newGameState():GameState{
   var state:GameState = {
      playerSequence    : [],
      aiSequence        : [],
      currentTurn       : Turn.AI,
      strictMode        : false,
      scoreHistory      : [],
      isPlaying         : false,
   };
   currentSession.gameStates.push(state);
   return state;
}

function getRandomOption():string
{
   return Options[Math.floor(Math.random() * (Options.length)) + 0];
}

function addAiMove(_moveOption:string){
   var move:Move = {
      option   : _moveOption,
      moveIndex: currentState.aiSequence.length,
   };
   currentState.aiSequence.push(move);
}

function playAiSequence():Promise<boolean>{
   var promise:Promise<boolean> = new Promise(function(resolve, reject){
      currentState.aiSequence.forEach(function(move:Move){
         setTimeout(function(){
            if(currentState.isPlaying){
               playSoundById(move.option);
               highlightElement(move.option);
               if(currentState.aiSequence.indexOf(move) === (currentState.aiSequence.length-1)){
                  resolve(true);
               }
            }
         }, currentState.aiSequence.indexOf(move) * 1500);
      });
   });
   return promise;
}

function startPlayerTurn():Promise<boolean>{
   return new Promise(function(resolve, reject){
      currentState.currentTurn = Turn.PLAYER;
      var playerTurnEnded:boolean = false;
      resolve(true);
   });
}

function listenToAnswer():Promise<any>{
   return new Promise(function(resolve, reject){
      var interval = setInterval(function(){
         console.log(playerPickedWrongOption());
         if(playerCompletedTurn() || playerPickedWrongOption()){
            clearInterval(interval);
            resolve(!playerPickedWrongOption());
         }
      }, 200);
   });
}

function handlePlayerResponse(submissionCorrect:boolean):Promise<any>{
   return new Promise(function(resolve, reject){
      if(submissionCorrect){
         console.log("good job");
         currentState.scoreHistory.push(currentState.aiSequence.length);
      } else {
         console.log("boo");
         if(currentState.strictMode){
            clearAiSequence();
         }
      }
      updateScore();
      clearUserSequence();
      currentState.currentTurn = Turn.AI;
      if(!submissionCorrect){
         feedbackWhenWrong()
            .then(function(){
               resolve(submissionCorrect);
            });
      } else {
         feedbackWhenCorrect()
            .then(function(){
               resolve(submissionCorrect);
            });
      }
   });
}

function feedbackWhenWrong():Promise<any>{
   return new Promise(function(resolve, reject){
      var rotationCycle = 0;
      var interval = setInterval(function(){
         elId('stageBox').style.transform = 'rotate(' + (45+Math.sin(rotationCycle/20)*5) + "deg)";
         rotationCycle++;
         if(rotationCycle >= 60*Math.PI){
            elId('stageBox').style.transform = 'rotate(45deg)';
            clearInterval(interval);
            resolve();
         }
      }, 10);
   });
}

function feedbackWhenCorrect():Promise<any>{
   return new Promise(function(resolve, reject){
      Options.forEach(function(option){
         elId(option).style.boxShadow = '0px 0px 28px 0px rgba(0,255,132,1);';
         setDelay(function(){
            return new Promise(function(res, rej){
               elId(option).style.boxShadow = 'none';
               res();
            });
         }, 1000).then(function(){
            setTimeout(function(){
               resolve();
            }, 500);
         })
      });
   });
}

function updateScore():void{
   elId("countValue").innerHTML = String(currentState.aiSequence.length);
}

function toggleStrictMode():void
{
   if(!currentState.isPlaying){
      currentState.strictMode = !currentState.strictMode;
      updateVisual();
   }
}

function updateVisual():void
{
   elId('strictModeToggler').innerHTML = currentState.strictMode ? "ON" : "OFF";
   elId('startButton-text').innerHTML = currentState.isPlaying ? "RESET" : "START";
   updateScore();
}

function getHighScore():number{
   return currentState.scoreHistory.reduce(function(max, score){
      return score > max ? score : max;
   }, 0);
}

function clearUserSequence(){
   currentState.playerSequence = [];
}

function clearAiSequence(){
   currentState.aiSequence = [];
}

function playerPickedWrongOption():boolean{
   if(currentState.playerSequence.length == 0){
      return false;
   } else {
      return !(currentState.playerSequence.filter(function(move:Move){
         return move.option == currentState.aiSequence[move.moveIndex].option;
      }).length == currentState.playerSequence.length);
   }
}

function playerCompletedTurn():boolean{
   return currentState.playerSequence.length >= currentState.aiSequence.length;
}

function addPlayerMove(_moveOption:string){
      var move:Move = {
         option   : _moveOption,
         moveIndex: currentState.playerSequence.length,
      };
      if(currentState.playerSequence.length < currentState.aiSequence.length){
         currentState.playerSequence.push(move);
      }
}

function elId(id:string){
   return document.getElementById(id);
}

function elsClass(className:string){
   return Array.prototype.slice.call(document.getElementsByClassName(className));
}

function log(arg){
   return console.log(arg);
}

function onBoxClick(id:string){
   if(currentState.currentTurn === Turn.PLAYER){
      playSoundById(id);
      highlightElement(id);
      addPlayerMove(id);
   }
}

function playSoundById(id:string){
   var audio = soundMap[id]();
   audio.volume = 0.5;
   audio.play();
}

function highlightElement(id:string){
   elId(id).className += " blinking";
   setTimeout(function(){
      var className:Array<string> = elId(id).className.split(' ');
      className.pop();
      elId(id).className = className.join(' ');
   }, 700);
}

function setDelay(callback:()=>Promise<any>, delay):Promise<any>{
   return new Promise(function(resolve, reject){
      setTimeout(function(){
         callback().then(function(result){
            resolve(result);
         });
      }, delay);
   });
}

function transmitSessionData():void{
   var xhr:XMLHttpRequest = new XMLHttpRequest();
   var url="/gameSession";
   xhr.open('POST', url);
   xhr.setRequestHeader("Content-type", "application/json");
   xhr.onreadystatechange = function(){
      if(xhr.readyState === 4 && xhr.status === 200){
         console.log(xhr.responseText);
      }
   }
   // var nameInput:HTMLInputElement = elId('input_signature');
   // currentSession.userSignature = nameInput.value;
   xhr.send(JSON.stringify(packageDataForTransmission(currentSession)));
}

function getLatestState():void{
   var xhr:XMLHttpRequest = new XMLHttpRequest();
   var url="/latestState";
   xhr.open('GET', url);
   xhr.setRequestHeader("Content-type", "application/json");
   xhr.onreadystatechange = function(){
      if(xhr.readyState === 4 && xhr.status === 200){
         console.log(xhr.responseText);
         currentState = JSON.parse(xhr.responseText);
         updateVisual();
         if(currentState.isPlaying){
            startCycle(true);
         }
      }
   }
   xhr.send(JSON.stringify(packageDataForTransmission(currentSession)));
}

function packageDataForTransmission(data:any):Object{
   return {
      timestamp: Date.now(),
      data: data
   };
}
