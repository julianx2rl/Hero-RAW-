var doomcounter = 0;

var doomtotal = 0;

var learningtimer = 0;

var stuncounter = 0;

var knowledge = []; // Base de conocimientos

var temporary = 666; // Donde se guarda el canal que estaba aprendiendo

var bloqueo = false; // Si bloquea el tiempo de aturde se reduce!

var currentlylearning = false; // Esta contando para registrar conocimiento nuevo?

var currentlystunned = false; // Si esta aturdido no puede actuar

var _messageChannels = [0, 1, 2, 3, 4, 5, 6, 7];

// Animations:
// 0-Start!
// 1-Watch Out! - Detects an attack.
// 2-Big Brain Time! - Makes a decision!
// 3-Uh Oh. - Needs teaching / Don't know what to do.
// 4-Shield! - Reduce stun.
// 5-Teach! - Passing knowledge.
// 6-Tic
// 7-Toc
// 8-Stunned...

function KnowledgeEntry(id, time) {
    this.id = id;
    this.duration = time;
	return this;
}

function isEven(n) {
   return n % 2 == 0;
}

function increasesecond(){
	if(currentlylearning){
		++doomcounter; // Cronometro que determinara cuanto dura el ataque
		if(isEven(doomcounter)){
			playMatrixAnimation(6, true);
		}else{
			playMatrixAnimation(7, true);
		}
		
		if(bloqueo == false){
			var block = getRandomInt(0, 100);
			if(block == 1){ // Probabilidad de 1% por segundo para bloquear sin saber.
				bloqueo = true;
			}
		}
		
		if(60 < doomcounter){
			currentlylearning = false;
			bloqueo = false;
			doomcounter = 0;
		}
	}
	if(currentlystunned){
		--stuncounter;
		if(isEven(stuncounter)){
			playMatrixAnimation(6, true);
		}else{
			playMatrixAnimation(7, true);
		}
		if(stuncounter <= 0)
		{
			currentlystunned = false;
			stuncounter = 0;
			if(temporary == 3){
				sendIRMessage(3, 5);
			}else if(temporary == 4){
				sendIRMessage(4, 5);
			}else{
				sendIRMessage(5, 5);
			}
			playMatrixAnimation(5, true);
		}
	} else {
		sendIRMessage(7, 5);
	}
	
	decision(); // Cada segundo analiza su situacion y decide que hacer
}

function decision(){
	if((0 < doomcounter && currentlylearning == false) && (bloqueo == false)){ // Está bajo ataque y ya sabe cuanto le queda! Y aun no está bloqueando...
		// Doomcounter es el  contador el cual baja en tiempo real
		
		// Doomtotal es toda la cantidad de tiempo que dura el ataque
		--doomcounter;
		if(doomtotal * (2/3) <= doomcounter){ // Si quedan mas de 2/3 del ataque
			startIRFollow(0, 1);
			
			var stop = getRandomInt(0, 10);
			
			if(stop < 8){ // 20% de probabilidad de no seguir
				stopIRFollow();
			}
			
		}else if(doomtotal * (1/2) <= doomcounter){ // Si queda menos de 2/3 pero mas de la mitad
				startIREvade(0, 1);
				
				var stop = getRandomInt(0, 10);
				
				if(stop < 9){ // 10% de probabilidad de no evadir
					stopIRFollow();
				}
		} else { // Si queda menos de la mitad de tiempo!
			// Debe bloquear!
			bloqueo = true;
		}
	}
}

async function startProgram() {
	playMatrixAnimation(0, true);
	
	var timeinc = setInterval(increasesecond, 1000);
	
	//clearInterval();
	listenForIRMessage(_messageChannels);
}						

async function onIRMessageX(channel) {
	if(_messageChannels.includes(channel) && !currentlystunned)
	{
		switch(channel) {
			case 0: // Ataque Monstruo Ligero (Sphero no sabe eso al inicio)
			case 1: // Ataque Monstruo Medio
			case 2: // Ataque Monstruo Pesado
				// Respuesta al ataque
				// Agregar conocimiento - knowledge.push(KnowledgeEntry(1,1));
				if (currentlylearning == false){ // Va a revizar si tiene conocimiento sobre el ataque actual
					var entry = false;
					
					for (var i = 0; i < knowledge.length; i++) {
						if(knowledge[i].id == channel){
							entry = knowledge[i]; // Si encuentra conocimiento que aplique entonces lo toma
							break;
  						}
					}
					
					if(entry != false){ // Si tiene conocimiento.
						doomcounter = entry.duration; // Entonces deberia alejarse o bloquear cuando el tiempo esté a punto de acabar.
						playMatrixAnimation(2, true); // Yeah... this is BIG BRAIN TIME!!!
					} else {
						temporary = channel; // Detecta nuevo tipo de ataque
						currentlylearning = true; // Empezara a contar el tiempo que tome en detectar el canal 6
						playMatrixAnimation(1, true);
					}
				}
			break;
			case 3:
			case 4:
			case 5:
				if(currentlylearning){ // Va a cancelar el aprendizaje porque ya no necesita aprender, le estan pasando lo que ocupa
					currentlylearning = false;
					doomcounter = 0;
					temporary = 666;
				}
				if(channel == 3){
					knowledge.push(KnowledgeEntry(0,45)); // No podemos enviar datos, por lo que debemos solamente darle la respuesta al sphero para simular transferencia de conocimiento.
				}else if(channel == 4){
					knowledge.push(KnowledgeEntry(0,60));
				}else{
					knowledge.push(KnowledgeEntry(0,90));
				}
			break;
			case 6: // El tick 6 es el que aturde!
				if(temporary != 666){
					knowledge.push(KnowledgeEntry(temporary,doomcounter));
					temporary = 666;
					doomcounter = 0;
				}
				var multiplier = 2;
				if(bloqueo)
				{
					multiplier = 1;
				}
				stuncounter = 4 * multiplier; // temporary * multiplier;
				currentlystunned = true;
				currentlylearning = false;
				playMatrixAnimation(8, true);
			break;
			default:
				//playMatrixAnimation(3, true);
			}
	}
	listenForIRMessage(_messageChannels);
}
registerEvent(EventType.onIRMessage, onIRMessageX);

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
	frames: [[[2, 2, 2, 1, 1, 1, 1, 1], [1, 2, 1, 1, 1, 1, 1, 1], [1, 2, 1, 1, 4, 1, 1, 1], [1, 1, 1, 1, 4, 1, 1, 1], [1, 1, 1, 1, 4, 1, 1, 1], [1, 6, 1, 1, 1, 1, 5, 5], [6, 6, 6, 1, 1, 1, 5, 1], [1, 6, 1, 1, 1, 1, 5, 5]]],
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
	frames: [[[2, 1, 1, 2, 2, 1, 1, 2], [1, 2, 2, 1, 1, 2, 2, 1], [1, 2, 2, 1, 1, 2, 2, 1], [2, 1, 1, 2, 2, 1, 1, 2], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 2, 2, 2, 2, 1, 1], [1, 2, 1, 1, 1, 1, 2, 1], [1, 1, 1, 1, 1, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
