var attacktype = 0;
var monsterHP = 9999;

var _messageChannels = [7];

var actions = [];

async function startProgram() {
	startIRBroadcast(6, 7);
	
	listenForIRMessage(_messageChannels);

	while(0 <= monsterHP){
		await decideattack();
		playMatrixAnimation(0, true);
		await delay(10);
	}
	
	playMatrixAnimation(4, true);
}

async function decideattack(){
	attacktype = getRandomInt(0, 3);
	if (attacktype <= 1) {
		playMatrixAnimation(1, true);
		sendIRMessage(0, 64);
		await delay(15);
		playMatrixAnimation(5, true);
		sendIRMessage(6, 64);
	} else if (1 < attacktype && attacktype <= 2) {
		playMatrixAnimation(2, true);
		sendIRMessage(1, 64);
		await delay(30);
		playMatrixAnimation(5, true);
		sendIRMessage(6, 64);
	} else {
		playMatrixAnimation(0, true);
		await roll(getRandomInt(0, 359), getRandomInt(50, 70), getRandomInt(1, 3));
	}
}

async function onIRMessage7(channel) {
	if (channel !== 7) return;

	monsterHP = monsterHP - 10;

	listenForIRMessage(_messageChannels);
}
registerEvent(EventType.onIRMessage, onIRMessage7);

registerMatrixAnimation({
	frames: [[[5, 5, 1, 1, 1, 1, 5, 5], [5, 1, 1, 1, 1, 1, 1, 5], [1, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 2, 2, 0, 0, 0], [0, 0, 0, 2, 2, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 1], [5, 1, 1, 1, 1, 1, 1, 5], [5, 5, 1, 1, 1, 1, 5, 5]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 1, 1, 4, 1, 1, 1], [1, 1, 1, 4, 4, 1, 1, 1], [1, 1, 4, 4, 4, 1, 1, 1], [1, 1, 1, 1, 4, 1, 1, 1], [1, 1, 1, 1, 4, 1, 1, 1], [1, 1, 1, 1, 4, 1, 1, 1], [1, 1, 4, 4, 4, 4, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 1, 3, 3, 1, 1, 1], [1, 1, 3, 1, 1, 3, 1, 1], [1, 1, 3, 1, 1, 3, 1, 1], [1, 1, 1, 1, 3, 1, 1, 1], [1, 1, 1, 3, 1, 1, 1, 1], [1, 1, 3, 1, 1, 1, 1, 1], [1, 1, 3, 3, 3, 3, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 1, 2, 2, 1, 1, 1], [1, 1, 2, 1, 1, 2, 1, 1], [1, 1, 1, 1, 1, 2, 1, 1], [1, 1, 1, 2, 2, 1, 1, 1], [1, 1, 1, 1, 1, 2, 1, 1], [1, 1, 2, 1, 1, 2, 1, 1], [1, 1, 1, 2, 2, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[2, 2, 1, 1, 2, 2, 2, 1], [2, 1, 2, 1, 2, 1, 1, 1], [2, 1, 2, 1, 2, 2, 1, 1], [2, 2, 1, 1, 2, 2, 2, 1], [5, 5, 5, 1, 5, 5, 1, 1], [5, 1, 5, 1, 5, 1, 5, 1], [5, 5, 5, 1, 5, 1, 5, 1], [5, 1, 5, 1, 5, 5, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[0, 1, 0, 0, 0, 0, 1, 0], [0, 2, 2, 1, 1, 2, 2, 0], [1, 2, 2, 2, 2, 2, 2, 1], [2, 2, 2, 2, 2, 2, 2, 2], [2, 1, 1, 2, 2, 1, 1, 2], [0, 2, 1, 2, 2, 1, 2, 0], [0, 2, 2, 2, 2, 2, 2, 0], [0, 0, 0, 1, 1, 0, 0, 0]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
