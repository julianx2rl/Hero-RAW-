var doomcounter = 0;

var doomtotal = 0;

var learningtimer = 0;

var stuncounter = 0; // Cuanto tiempo estara aturdido

var knowledge = []; // Base de conocimientos

var temporary = 666; // Donde se guarda el canal que estaba aprendiendo

var bloqueo = false; // Si bloquea el tiempo de aturde se reduce!

var currentlylearning = false; // Esta contando para registrar conocimiento nuevo?

var _messageChannels = [0, 1, 2, 3, 4, 5, 6]; // Channels that must be noticed.

var _attackChannels = [0, 1]; // Notice a monster charging a attack!

var _learnChannels = [2, 3]; // Notice an ally trying to help you!

var _stunChannels = [4]; // Get dunked on! 5 = Heroes use it to attack!

// Animations:
// 0-Start!
// 1-Watch Out! - Detects an attack. / Charge!
// 2-Big Brain Time! - Makes a decision!
// 3-Uh Oh. - Needs teaching / Don't know what to do.
// 4-Shield! - Reduce stun.
// 5-Tic
// 6-Toc
// 7-Stunned...
// 8-Teach! - Passing knowledge.
// 9-Awake! - Not stunned!
// 10-I know what I'm dealing with!
// 11- Received - Right Here Amigo!
// 12- Learning - Imma gonna die!

async function onCollision() {
	playMatrixAnimation(0, true);
	await roll(getRandomInt(0, 359), getRandomInt(50, 70), getRandomInt(1, 3));
}
registerEvent(EventType.onCollision, onCollision);

function KnowledgeEntry(id, time) {
    this.id = id;
    this.duration = time;
	return this;
}

function isEven(n) {
   return n % 2 == 0;
}

function increasesecond(){
	// Is it learning?
	if(currentlylearning){
		learnfurther();
	} else if (0 < doomcounter){ // Is it preparing for an incoming attack?
		incomingAttack();
	} else if (0 < stuncounter){ // If the monster stunned me I'll...
		recover();
	}
}

function learnfurther(){
	++doomcounter; // Cronometro que determinara cuanto dura el ataque
	
	if(bloqueo == false){
		var block = getRandomInt(0, 100);
		if(block <= 1){ // Probabilidad de 1% por segundo para bloquear sin saber.
			bloqueo = true;
		}
	}
	
	if(50 < doomcounter){
		currentlylearning = false;
		bloqueo = false;
		doomcounter = 0;
	}
}

function incomingAttack(){
	--doomcounter;
	
	if(doomcounter <= 0)
	{
		doomtotal = 0;
	}
}

function recover(){
	--stuncounter;
	
	if(stuncounter <= 0)
	{
		stuncounter = 0;
		playMatrixAnimation(9, true);
	}
}

async function startProgram() {
	playMatrixAnimation(0, true);
	
	var timeinc1 = setInterval(increasesecond, 1000); // Increase / Decrease all the counters
	var timeinc2 = setInterval(decision, 2000); // Checks if anyknowledge about the attack has been found, and acts accordingly
	
	listenForIRMessage(_messageChannels); // Awaits for any interactions
	//onIRMessageAttack(1);
	//await delay(15)
	//onIRMessageStun(6);
	//await delay(20);
	//onIRMessageAttack(1);
}

async function onIRMessageAttack(channel)
{
	//await speak("Receive " + channel.toString(10), true);
	if(_attackChannels.includes(channel) && (stuncounter <= 0))
	{
		// Respuesta al ataque
		// Agregar conocimiento - knowledge.push(KnowledgeEntry(1,1));
		if (currentlylearning){ // Va a revizar si tiene conocimiento sobre el ataque actual
			currentlylearning = false;
			temporary = 666;
			doomcounter = 0;
		}
		var entry = false;
		
		for (var i = 0; i < knowledge.length; i++) {
			if(knowledge[i].id == channel){
				// playMatrixAnimation(8, true);
				entry = knowledge[i]; // Si encuentra conocimiento que aplique entonces lo toma
				break;
		  	}
		}
		
		if(entry != false){ // Si tiene conocimiento.
			//sendIRMessage(channel + 3, 5);
			doomtotal = entry.duration;
			doomcounter = entry.duration; // Entonces deberia alejarse o bloquear cuando el tiempo esté a punto de acabar.
			playMatrixAnimation(2, true); // Yeah... this is BIG BRAIN TIME!!!
		} else {
			temporary = channel; // Detecta nuevo tipo de ataque
			currentlylearning = true; // Empezara a contar el tiempo que tome en detectar el canal 6
		}
	} else if(_learnChannels.includes(channel) && (stuncounter <= 0))
	{
		if(currentlylearning){ // Va a cancelar el aprendizaje porque ya no necesita aprender, le estan pasando lo que ocupa
			currentlylearning = false;
			doomcounter = 0;
			temporary = 666;
		}
		
		// Aqui iria la revisión del conocimiento si los spheros pudiesen mandar variables...
		
		for (var i = 0; i < knowledge.length; i++) {
			if(knowledge[i].id == temporary){
				entry = knowledge[i]; // Si encuentra conocimiento que aplique entonces lo toma
				arr.splice(i, 1);
  			}
		}
		
		if(channel == 2){
			knowledge.push(KnowledgeEntry(0,15)); // No podemos enviar datos, por lo que debemos solamente darle la respuesta al sphero para simular transferencia de conocimiento.
		}else if(channel == 3){
			knowledge.push(KnowledgeEntry(1,30));
		}
		playMatrixAnimation(10, true);
	}else if(_stunChannels.includes(channel) && (stuncounter <= 0))
	{
		var entry = false;
		var obsolete = false;
		
		for (var i = 0; i < knowledge.length; i++) {
			if(knowledge[i].id == temporary){
				entry = knowledge[i]; // Si encuentra conocimiento que aplique entonces lo toma
				if(entry.duration < doomcounter){
					arr.splice(i, 1);
					obsolete = true;
				}
  			}
		}
		
		if(temporary != 666){
			if(entry == false || obsolete){
				playMatrixAnimation(8, true);
				knowledge.push(KnowledgeEntry(temporary,doomcounter));
			}
			temporary = 666;
			doomcounter = 0;
		}
		var multiplier = 2;
		if(bloqueo)
		{
			multiplier = 1;
		}
		bloqueo = false;
		stuncounter = 4 * multiplier; // temporary * multiplier;
		currentlylearning = false;
		playMatrixAnimation(7, true);
	}else{
		//decision();
	}
	
	listenForIRMessage(_messageChannels);
}registerEvent(EventType.onIRMessage, onIRMessageAttack);

async function decision(){
	if(stuncounter <= 0){
		// Attack if capable
		sendIRMessage(4, 20);
	}
	
	if((0 < doomcounter && 0 < doomtotal) && (stuncounter <= 0 && currentlylearning == false)){ // Está bajo ataque y ya sabe cuanto le queda! Y aun no está bloqueando...
		// Doomtotal es toda la cantidad de tiempo que dura el ataque
		
		if(doomtotal * (4/5) <= doomcounter){ // Si quedan mas de 4/5 del ataque
			playMatrixAnimation(10, true); // Attack!
			
			startIRFollow(6, 7);
			
			await delay(2);
			
			stopIRFollow();
			//await speak("Follow", true);
		}else if(doomtotal * (1/3) <= doomcounter){ // Si queda menos de 4/5 pero mas de 1/3
			playMatrixAnimation(3, true); // Run away!
			
			startIREvade(6, 7);
			
			await delay(2);
			
			stopIREvade();
			//await speak("Evade", true);
		} else { // Si queda menos de 1/3 de tiempo!
			playMatrixAnimation(4, true); // Take cover!
			
			bloqueo = true;
			
			await delay(2);
			
			bloqueo = false;
			//await speak("Shield", true);
		}
	} else if(stuncounter <= 0) {
		if(currentlylearning){
			playMatrixAnimation(12, true);
		}else if(0 < doomcounter){
			playMatrixAnimation(10, true);
		}else{
			playMatrixAnimation(1, true);
		}
		
		startIRFollow(6, 7);
		
		await delay(2);
		
		stopIRFollow();
	}
}					

registerMatrixAnimation({
	frames: [[[2, 2, 2, 2, 11, 11, 11, 11], [2, 1, 1, 1, 1, 11, 11, 1], [2, 2, 2, 2, 1, 11, 11, 1], [1, 1, 1, 2, 1, 11, 11, 1], [2, 2, 2, 2, 1, 11, 11, 1], [13, 13, 13, 13, 13, 13, 13, 13], [15, 15, 15, 15, 15, 15, 15, 15], [14, 14, 14, 14, 14, 14, 14, 14]], [[2, 2, 2, 2, 11, 11, 11, 11], [2, 1, 1, 1, 1, 11, 11, 1], [2, 2, 2, 2, 1, 11, 11, 1], [1, 1, 1, 2, 1, 11, 11, 1], [2, 2, 2, 2, 1, 11, 11, 1], [14, 14, 14, 14, 14, 14, 14, 14], [13, 13, 13, 13, 13, 13, 13, 13], [15, 15, 15, 15, 15, 15, 15, 15]], [[2, 2, 2, 2, 11, 11, 11, 11], [2, 1, 1, 1, 1, 11, 11, 1], [2, 2, 2, 2, 1, 11, 11, 1], [1, 1, 1, 2, 1, 11, 11, 1], [2, 2, 2, 2, 1, 11, 11, 1], [15, 15, 15, 15, 15, 15, 15, 15], [14, 14, 14, 14, 14, 14, 14, 14], [13, 13, 13, 13, 13, 13, 13, 13]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[3, 1, 1, 2, 2, 1, 1, 3], [4, 1, 1, 2, 2, 1, 1, 4], [5, 1, 1, 2, 2, 1, 1, 5], [6, 1, 1, 2, 2, 1, 1, 6], [6, 1, 1, 2, 2, 1, 1, 6], [5, 1, 1, 1, 1, 1, 1, 5], [4, 1, 1, 2, 2, 1, 1, 4], [3, 1, 1, 2, 2, 1, 1, 3]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 14, 14, 14, 13, 13, 13, 1], [1, 14, 1, 14, 13, 1, 13, 1], [1, 14, 14, 1, 13, 13, 1, 1], [1, 14, 1, 14, 13, 1, 13, 1], [1, 14, 14, 14, 13, 13, 13, 1], [2, 2, 4, 7, 7, 7, 6, 6], [1, 2, 4, 7, 1, 7, 6, 1], [1, 2, 4, 7, 1, 7, 6, 6]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 1, 10, 1, 1, 1, 1], [1, 1, 10, 10, 10, 1, 1, 1], [1, 1, 10, 9, 10, 10, 1, 1], [1, 10, 9, 10, 10, 10, 1, 1], [1, 10, 9, 10, 10, 10, 10, 1], [1, 10, 9, 10, 10, 10, 10, 1], [1, 1, 10, 9, 10, 10, 1, 1], [1, 1, 1, 10, 10, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 1, 1, 1, 1, 1, 1], [1, 2, 2, 2, 2, 2, 2, 1], [1, 2, 0, 10, 10, 10, 2, 1], [1, 2, 0, 0, 10, 10, 2, 1], [1, 2, 10, 0, 0, 10, 2, 1], [1, 2, 10, 10, 0, 0, 2, 1], [1, 1, 2, 10, 10, 2, 1, 1], [1, 1, 1, 2, 2, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[2, 2, 2, 1, 1, 1, 1, 1], [1, 2, 1, 1, 1, 1, 1, 1], [1, 2, 1, 4, 4, 4, 1, 1], [1, 1, 1, 4, 1, 4, 1, 1], [1, 1, 1, 4, 4, 4, 1, 1], [6, 1, 6, 1, 1, 1, 5, 5], [1, 6, 1, 1, 1, 1, 5, 1], [6, 1, 6, 1, 1, 1, 5, 5]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[2, 2, 2, 1, 1, 1, 1, 1], [1, 2, 1, 1, 1, 1, 1, 1], [1, 2, 1, 1, 4, 1, 1, 1], [1, 1, 1, 1, 4, 1, 1, 1], [1, 1, 1, 1, 4, 1, 1, 1], [1, 6, 1, 1, 1, 1, 5, 5], [6, 6, 6, 1, 1, 1, 5, 1], [1, 6, 1, 1, 1, 1, 5, 5]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[2, 1, 1, 2, 2, 1, 1, 2], [1, 2, 2, 1, 1, 2, 2, 1], [1, 2, 2, 1, 1, 2, 2, 1], [2, 1, 1, 2, 2, 1, 1, 2], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 2, 2, 2, 2, 1, 1], [1, 2, 1, 1, 1, 1, 2, 1], [1, 1, 1, 1, 1, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [2, 2, 2, 2, 2, 2, 2, 2], [2, 9, 9, 2, 2, 9, 9, 2], [2, 9, 9, 2, 2, 9, 9, 2], [1, 2, 2, 1, 1, 2, 2, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[5, 5, 1, 1, 1, 1, 5, 5], [5, 1, 1, 1, 1, 1, 1, 5], [1, 1, 0, 0, 0, 0, 1, 1], [1, 0, 0, 1, 1, 0, 0, 1], [0, 0, 0, 1, 1, 0, 0, 0], [1, 0, 0, 11, 11, 0, 0, 1], [5, 1, 0, 0, 0, 0, 1, 5], [5, 5, 1, 1, 1, 1, 5, 5]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[11, 1, 1, 10, 10, 1, 1, 11], [10, 1, 1, 10, 10, 1, 1, 10], [9, 1, 1, 10, 10, 1, 1, 9], [0, 1, 1, 10, 10, 1, 1, 0], [0, 1, 1, 10, 10, 1, 1, 0], [9, 1, 1, 1, 1, 1, 1, 9], [10, 1, 1, 10, 10, 1, 1, 10], [11, 1, 1, 10, 10, 1, 1, 11]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [5, 1, 1, 1, 1, 1, 1, 11], [5, 5, 1, 11, 5, 1, 11, 11], [5, 5, 5, 5, 5, 5, 11, 11], [5, 5, 5, 5, 5, 5, 11, 11], [1, 1, 11, 5, 5, 5, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[12, 1, 1, 12, 12, 1, 1, 12], [13, 1, 1, 12, 12, 1, 1, 13], [15, 1, 1, 12, 12, 1, 1, 15], [14, 1, 1, 12, 12, 1, 1, 14], [14, 1, 1, 12, 12, 1, 1, 14], [15, 1, 1, 1, 1, 1, 1, 15], [13, 1, 1, 12, 12, 1, 1, 13], [12, 1, 1, 12, 12, 1, 1, 12]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
