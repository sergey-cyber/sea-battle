
//Canvas Settings
let turnText = document.querySelector("#turn");
const playerName = document.querySelector("#name");
const validate = document.querySelector(".validate");
const inputName = document.querySelector("#inputName");
const startPage = document.querySelector(".startPage");
const btnStart = document.querySelector("#btnStart");
const body = document.getElementsByTagName('body');
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let cellSize =  body[0].clientWidth > 1000 ? 40 :  30;
const width = canvas.width = cellSize*24;
const height = canvas.height = cellSize*11;
//

//Draw playing fields

const drawText = () => {
	const letters = ['a','b','c','d','e','f','g','h','i','k'];
	let x = cellSize+15;
	let y = cellSize*2;
	let count = 1;
	letters.forEach( (letter) => {
		ctx.font = "25px serif";
		ctx.textBaseline = "bottom";
		ctx.textAlign = 'center';
		ctx.fillText(`${letter}`, x, cellSize);
		ctx.fillText(`${letter}`, x+cellSize*12, cellSize);
		ctx.fillText(`${count}`, 15, y);
		ctx.fillText(`${count}`, cellSize*12+15, y);
		x+=cellSize;
		y+=cellSize;
		count++;
	});
}

const drawGrid = () => {
	let x1 = cellSize;
	let y1 = cellSize;
	let x2 = cellSize;
	let y2 = cellSize;
	for(i=0; i < 10; i++) {
		ctx.beginPath(); //draw vertical line      
		ctx.moveTo(x1, y1);    
		ctx.lineTo(x1, y1*11);  
		ctx.stroke();
		ctx.beginPath();       
		ctx.moveTo(x1+cellSize*12, y1);    
		ctx.lineTo(x1+cellSize*12, y1*11);  
		ctx.stroke();
		x1 += cellSize; 
		ctx.beginPath(); //draw horizontal line      
		ctx.moveTo(x2, y2);    
		ctx.lineTo(x2*11, y2);  
		ctx.stroke();
		ctx.beginPath();       
		ctx.moveTo(x2+cellSize*12, y2);    
		ctx.lineTo(x2+cellSize*22, y2);  
		ctx.stroke();
		y2 += cellSize; 
	}	 
}

const drawPlayingFields = (cellSize) => {
	ctx.rect(cellSize, cellSize, cellSize*10, cellSize*10);
	ctx.rect(cellSize*13, cellSize, cellSize*10, cellSize*10);
	ctx.stroke();
	drawText();	//Draw letters and numbers
	drawGrid();
}

drawPlayingFields(cellSize);
//

let occupiedCellsForPlayer = []; //when drawing a cell, its coordinates are added in this array 
let occupiedCellsForEnemy = []; //when drawing a cell, its coordinates are added in this array 

const matchCheck = (coordinates, forEnemy) => {	
	let playerField;
	if(forEnemy) {
		playerField = {
			x1: cellSize*13,
			x2: cellSize*22,
			y1: cellSize,
			y2: cellSize*10
		};
	} else {
		playerField = {
			x1: cellSize,
			x2: cellSize*10,
			y1: cellSize,
			y2: cellSize*10
		};
	}
	const isMatchCheck = (array) =>  {
		let isMatch = array.some((el) => { 
			return el.x === coordinates.x && el.y === coordinates.y 
					|| el.x+cellSize === coordinates.x && el.y === coordinates.y		
						|| el.x === coordinates.x && el.y+cellSize === coordinates.y
							|| el.x+cellSize === coordinates.x && el.y+cellSize === coordinates.y
								|| el.x+cellSize === coordinates.x && el.y-cellSize === coordinates.y	 
									|| el.x-cellSize === coordinates.x && el.y === coordinates.y
										|| el.x-cellSize === coordinates.x && el.y-cellSize === coordinates.y
											|| el.x === coordinates.x && el.y-cellSize === coordinates.y
												|| el.x-cellSize === coordinates.x && el.y+cellSize === coordinates.y
		}) || coordinates.x < playerField.x1 || coordinates.x > playerField.x2 
				|| coordinates.y < playerField.y1 || coordinates.y > playerField.y2;
		return isMatch;
	}
	let isMatch = forEnemy ? isMatchCheck(occupiedCellsForEnemy) : isMatchCheck(occupiedCellsForPlayer);
	return isMatch;
}

const setRandomCoordinates = (forEnemy) => {
	const randomCoordinates = {
		x: !forEnemy ? Math.floor((Math.random() * 10 + 1))*cellSize
			: Math.floor((Math.random() * 23 + 10))*cellSize,
		y: Math.floor((Math.random() * 10 + 1))*cellSize
	}; 
	if (matchCheck(randomCoordinates, forEnemy)) {
		return setRandomCoordinates(forEnemy);
	} else {
		return randomCoordinates;
	}; 
}

const createNewCellForShip = (x, y, direction) => {
	switch(direction) {
		case 1:{				
			return new Cell(null, x+cellSize, y)
		}
		case 2: {
			return new Cell(null, x-cellSize, y)
		}
		case 3: {
			return new Cell(null, x, y+cellSize)
		}
		case 4: {
			return new Cell(null, x, y-cellSize)
		}
	}
}

class Cell {
	constructor (coordinates, x, y) {
		this.coordinates = coordinates;
		this.x = coordinates ? coordinates.x : x;
		this.y = coordinates ? coordinates.y : y;
	}
	render() {
		ctx.fillStyle = 'black';
		ctx.fillRect(this.x, this.y, cellSize, cellSize);	
	}
}

class Ship {
	constructor (decks, forEnemy = false) {
		this.decks = decks;
		this.ship = [];
		this.forEnemy = forEnemy;
	}
	formationShip() {
		this.ship.push(new Cell(setRandomCoordinates(this.forEnemy)));
		//let tempArr = [];
		let count = this.decks;
		let createAdjacentCell = (index = 0, direction = 1) => {	
			if(direction > 4) {
				console.log('new random Cell');
				this.ship = [];
				direction = 0;
				return this.formationShip();
			}						
			let adjCell = createNewCellForShip(this.ship[index].x, this.ship[index].y, direction);
			if(!matchCheck(adjCell, this.forEnemy)) {
				this.ship.push(adjCell);
				count--;
				let nextDir = direction;
				if((count-1) > 0) {	
					return createAdjacentCell(index+1, nextDir);
				} else {
					for(i=0; i<this.ship.length; i++) {
						this.forEnemy ? occupiedCellsForEnemy.push(this.ship[i]) 
							: occupiedCellsForPlayer.push(this.ship[i]);
					}
				}
			} else {
				this.ship.splice(1, this.ship.length);
				count = this.decks;
				console.log('rotate ship')
				return createAdjacentCell(0, direction + 1);
			}			
		}
		if(this.decks > 1) {
			createAdjacentCell()
		} else {
			this.forEnemy ? occupiedCellsForEnemy.push(this.ship[0]) 
				: occupiedCellsForPlayer.push(this.ship[0]);
		}
	}
	render() {
		this.formationShip();
		for(i=0; i<this.ship.length; i++) {
			this.ship[i].render();
		}
	}
}

/* const drawPlayerShips = () => {
	let deck1 = 4;
	let deck2 = 3;
	let deck3 = 2;
	let deck4 = 1;
} */

let ship10 = new Ship(4);
ship10.render(); 
let ship1 = new Ship(1);
ship1.render();
let ship2 = new Ship(1);
ship2.render();
let ship3 = new Ship(1);
ship3.render();
let ship4 = new Ship(1);
ship4.render();
let ship5 = new Ship(2);
ship5.render();
let ship6 = new Ship(2);
ship6.render();
let ship7 = new Ship(2);
ship7.render();
let ship8 = new Ship(3);
ship8.render();
let ship9 = new Ship(3);
ship9.render();

let ship11 = new Ship(4, true);
ship11.formationShip()//.render(); 
let ship12 = new Ship(1, true);
ship12.formationShip()//.render();
let ship13 = new Ship(1, true);
ship13.formationShip()//.render();
let ship14 = new Ship(1, true);
ship14.formationShip()//.render();
let ship15 = new Ship(1, true);
ship15.formationShip()//.render();
let ship16 = new Ship(2, true);
ship16.formationShip()//.render();
let ship17 = new Ship(2, true);
ship17.formationShip()//.render();
let ship18 = new Ship(2, true);
ship18.formationShip()//.render();
let ship19 = new Ship(3, true);
ship19.formationShip()//.render();
let ship20 = new Ship(3, true);
ship20.formationShip()//.render();

////////////////////////////////////////

const drawRect = (x, y, size, color) => {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, size, size);	
}

let whoIsDoingNow = 'player';
let attemptsUsed = [];
let playerScore = 0;
let enemyScore = 0;

const gameOverCheck = () => {
	if(playerScore === 10) {
		turnText.style.color = 'green';
		turnText.innerHTML = 'YOU WIN';
	} else if (enemyScore === 10) {
		turnText.style.color = 'red';
		turnText.innerText = 'Game Over, you Lose';
	}
}

const enemyTurn = () => {	
	const randomCoordinates = {
		x: Math.floor((Math.random() * 10 + 1))*cellSize,
		y: Math.floor((Math.random() * 10 + 1))*cellSize
	}; 
	setTimeout(() => {
		if (attemptsUsed.some((el) => el.x === randomCoordinates.x && el.y === randomCoordinates.y)) {
			return enemyTurn();
		} else {
			attemptsUsed.push(randomCoordinates);
			if(occupiedCellsForPlayer.some((el) => el.x === randomCoordinates.x && el.y === randomCoordinates.y)) {
				drawRect(randomCoordinates.x, randomCoordinates.y, cellSize, 'red');
				enemyScore++;
			} else {
				drawRect(randomCoordinates.x, randomCoordinates.y, cellSize, 'green');
			}
		}; 
		turnText.innerHTML = 'Your turn';
		whoIsDoingNow = 'player';
		gameOverCheck();
	}, 2000);
}

canvas.addEventListener('click', (e) => {
	let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;	
	let eventCell = {
		x: x - (x % cellSize),
		y: y - (y % cellSize)
	}
	const coordinateData = [
		{'a': cellSize*13}, {'b': cellSize*14}, {'c': cellSize*15}, {'d': cellSize*16},
		 {'e': cellSize*17}, {'f': cellSize*18}, {'g': cellSize*19}, {'h': cellSize*20},
		  {'i': cellSize*21}, {'k': cellSize*22}
	];
	if(eventCell.x < cellSize*13 || eventCell.x > cellSize*22 || eventCell.y < cellSize
		 || whoIsDoingNow === 'enemy' || enemyScore === 10 || playerScore === 10) {
		return;
	} else {
		coordinateData.forEach((el) => {
			for(key in el) {
				if(el[key] === eventCell.x) 
				{console.log(key + '  ' + eventCell.y/cellSize)}
			}				
		});
		if(occupiedCellsForEnemy.some((el) =>  el.x === eventCell.x && el.y === eventCell.y)) {
			drawRect(eventCell.x, eventCell.y, cellSize, 'red');
			playerScore++;					
		} else {
			drawRect(eventCell.x, eventCell.y, cellSize, 'green');
		}  
		turnText.innerHTML = 'Enemy turn';
		whoIsDoingNow = 'enemy'
		enemyTurn();
	}
    gameOverCheck();	
});

btnStart.onclick = () => {
	if(inputName.value) {
		startPage.style.display = 'none';
		playerName.innerHTML = inputName.value;
	} else {
		inputName.classList.add('error');
		validate.innerHTML = 'This field is required, inter your name';
		//inputName.placeholder = 'blablabla';
	}	
}

/* 
window.onload = function() {	//Запускает функцию game после загрузки фона
	game();
}

//Основной игровой цикл
function game() {
	update();
	render();
	requestAnimationFrame(game);
}

function update() {
	//функция отвечает за физику 
	//(движение, изменение направления и т.д)

}

function render() {
	//функция отвечает за отрисовку элементов
}

 */








