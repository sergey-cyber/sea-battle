
const preloader = document.querySelector(".preloader");
window.onload = () => {
	preloader.style.display = 'none';
	let turnText = document.querySelector("#turn");
	const playerName = document.querySelector("#name");
	const validate = document.querySelector(".validate");
	const inputName = document.querySelector("#inputName");
	const startPage = document.querySelector(".startPage");
	const btnStart = document.querySelector("#btnStart");

	let occupiedCellsForPlayer = []; //when drawing a cell, its coordinates are added in this arrays 
	let occupiedCellsForEnemy = []; 

	const setRandomCoordinates = (forEnemy) => {	//Generate obj with random coordinates x and y
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

	const matchCheck = (coordinates, forEnemy) => {	
		let playerField;
		//checks cells for matches and out of fields borer and return boolean
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
		constructor (coordinates, x, y) {	//coordinate needed to determine the first random cell for Ship 
			//x and y for create adjacent cells 			
			this.coordinates = coordinates;
			this.x = coordinates ? coordinates.x : x;
			this.y = coordinates ? coordinates.y : y;
			this.isDestroyed = false;
		}
		render() {
			ctx.fillStyle = 'black';
			ctx.fillRect(this.x, this.y, cellSize, cellSize);	
		}
		destrucnion() {
			this.isDestroyed = true;
		}
	}
	
	class Ship {
		constructor (decks, forEnemy = false) {
			this.decks = decks;
			this.ship = [];
			this.forEnemy = forEnemy;	//if true, a ship is created for the enemy	
			this.isDestroyed = false;
		}
		isDestrucnion() {
			this.isDestroyed = this.ship.every((el) => el.isDestroyed);
		}
		formationShip() {	//formation ships in fields 
			this.ship.push(new Cell(setRandomCoordinates(this.forEnemy)));	//first cell in ship is random
			let count = this.decks;
			let createAdjacentCell = (index = 0, direction = 1) => { //create cells for ship in different
				//direction 	
				if(direction > 4) {	
					//if all directions fail validation, then generate new randow coordinate
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
					//if created cells fail validation, then create cells in other direction
					this.ship.splice(1, this.ship.length);
					count = this.decks;
					return createAdjacentCell(0, direction + 1);
				}			
			}
			if(this.decks > 1) {
				createAdjacentCell()
				//dont start this function for 1 deck ship 
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

	const drawPlayerShips = (forEnemy) => {
		//function for create, formation and render ships
		let playerShips = [];
		for(i=1; i<11; i++) {
			if(i<2) {
				playerShips.push(new Ship(4, forEnemy))
			} else if(i>1 && i<6) {
				playerShips.push(new Ship(1, forEnemy))
			} else if(i>5 && i<9) {
				playerShips.push(new Ship(2, forEnemy))
			} else if(i>8 && i<11) {
				playerShips.push(new Ship(3, forEnemy))
			} else {return}
		}
		playerShips.forEach((el) => {
			forEnemy ? el.formationShip() : el.render();
		})
		return playerShips;
	}

	const playerShips = drawPlayerShips();	//create and render player ships
	const enemyShips = drawPlayerShips(true);	//create and formation enemys ship

	const getFieldCoordinste = () => {
		let fieldCoordinates = [];
		let x = 1;
		let y = 1;
		for(i=1; i<101; i++) {
			if(x>10) {
				x = 1; y++;
			}
			fieldCoordinates.push({x: x*cellSize, y: y*cellSize});
			x++		
		}
		return fieldCoordinates;
	}

	const fieldCoordinates = getFieldCoordinste(); //create array with all coordinates player field
	//and enemy get random coordinate and deleted its
	
	let whoIsDoingNow = 'player';
	let playerScore = 0;
	let enemyScore = 0;

	
	const gameOverCheck = () => {
		if(playerScore === 20) {
			turnText.style.color = 'red';
			turnText.innerHTML = 'YOU WIN';
		} else if (enemyScore === 20) {
			turnText.style.color = 'red';
			turnText.innerText = 'Game Over, you Lose';
		}
	}

	const drawRectAroundCell = (coordinateArray, color, forEnemy = false) => {
		//this function start if any ship is destroy and draw rect arround this ship
		let dontShootCoordinate = []; 
		const checkBorderField = (x, y, forEnemy) => {
			let playerField;
			if(!forEnemy) {
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
			let dontDraw;
			forEnemy ? 
			playerShips.forEach((el) => {
				el.ship.forEach((cell) => {
					if(cell.x == x && cell.y == y) {
						dontDraw = {x: cell.x, y: cell.y}
					}
				})
			})
			:
			enemyShips.forEach((el) => {
				el.ship.forEach((cell) => {
					if(cell.x == x && cell.y == y) {
						dontDraw = {x: cell.x, y: cell.y}
					}
				})
			});
			let isError = dontDraw != undefined || x < playerField.x1 || x > playerField.x2 
							|| y < playerField.y1 || y > playerField.y2;
			return isError;
		}
		const aroundDrawwer = (x, y, color) => {
			ctx.fillStyle = color;
			let countX = 0;
			let countY = 0;
			for(i=0; i<9; i++) {
				if(i<2){
					if(!checkBorderField(x+countX, y-cellSize, forEnemy)) {
						dontShootCoordinate.push({x: x+countX, y: y-cellSize});
						ctx.fillRect(x+countX, y-cellSize, cellSize, cellSize);
					}
					countX += cellSize;
				} else if(i>1 && i<4) {
					if(!checkBorderField(x+cellSize, y+countY, forEnemy)) {
						dontShootCoordinate.push({x: x+cellSize, y: y+countY});
						ctx.fillRect(x+cellSize, y+countY, cellSize, cellSize);
					}
					countY += cellSize;
					countX -= cellSize;
				} else if(i>3 && i<6) {
					if(!checkBorderField(x-countX, y+cellSize, forEnemy)) {
						dontShootCoordinate.push({x: x-countX, y: y+cellSize});
						ctx.fillRect(x-countX, y+cellSize, cellSize, cellSize);
					}
					countX -= cellSize;
					countY -= cellSize/2;
				} else if(i>5 && i<9) {
					if(!checkBorderField(x-cellSize, y-countY, forEnemy)) {
						dontShootCoordinate.push({x: x-cellSize, y: y-countY});
						ctx.fillRect(x-cellSize, y-countY, cellSize, cellSize);
					}
					countY -= cellSize;
				}						
			} 	
		}
		coordinateArray.forEach((el) => {
			aroundDrawwer(el.x, el.y, color);
		});
		if(forEnemy) {
			//if enemy turn, delete coordinates arround destroyed ship 
			fieldCoordinates.forEach( (el, index) => {
				dontShootCoordinate.forEach((coord) => {
					if(el.x === coord.x && el.y === coord.y) {
						fieldCoordinates.splice(index, 1);
					}
				})
			});
		}
	}
	
	const enemyTurn = () => {	
		const randomIndex = Math.floor((Math.random() * fieldCoordinates.length)); //return random index array
		const randomCoordinates = {
			x: fieldCoordinates[randomIndex].x,
			y: fieldCoordinates[randomIndex].y
		}; 
		fieldCoordinates.splice(randomIndex, 1);
		setTimeout(() => {						
			if(occupiedCellsForPlayer.some((el) => el.x === randomCoordinates.x && el.y === randomCoordinates.y)) {
				drawRect(randomCoordinates.x, randomCoordinates.y, cellSize, 'red');
				playerShips.forEach((el) => {
					el.ship.forEach((cell) => {
						if(cell.x === randomCoordinates.x && cell.y === randomCoordinates.y) {
							cell.destrucnion();
						}
					});
					el.isDestrucnion();
					el.isDestroyed && drawRectAroundCell(el.ship, 'green', true);
				});
				enemyScore++;
				enemyTurn();
			} else {
				drawRect(randomCoordinates.x, randomCoordinates.y, cellSize, 'green');
				turnText.innerHTML = 'Your turn';
				whoIsDoingNow = 'player';
			}; 
			gameOverCheck();
		}, 1500);
	}
	
	canvas.addEventListener('click', (e) => {
		let rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;	
		let eventCell = {
			x: x - (x % cellSize),
			y: y - (y % cellSize)
		}
		if(eventCell.x < cellSize*13 || eventCell.x > cellSize*22 || eventCell.y < cellSize
			 || whoIsDoingNow === 'enemy' || enemyScore === 20 || playerScore === 20) {
			return;
		} else {
			if(occupiedCellsForEnemy.some((el) =>  el.x === eventCell.x && el.y === eventCell.y)) { // if hit
				drawRect(eventCell.x, eventCell.y, cellSize, 'red');
				enemyShips.forEach((el) => {
					el.ship.forEach((cell) => {
						if(cell.x === eventCell.x && cell.y === eventCell.y) {
							cell.destrucnion();
						}
					});
					el.isDestrucnion();
					el.isDestroyed && drawRectAroundCell(el.ship, 'green'); // if ship destroyed
				});
				playerScore++;					
			} else {
				drawRect(eventCell.x, eventCell.y, cellSize, 'green');
				turnText.innerHTML = 'Enemy turn';
				whoIsDoingNow = 'enemy'
				enemyTurn();
			}  
		}
		gameOverCheck();	
	});
	
	btnStart.onclick = () => {	//Start game button
		if(inputName.value) {
			startPage.style.display = 'none';
			playerName.innerHTML = inputName.value;
		} else {
			inputName.classList.add('error');
			validate.innerHTML = 'This field is required, inter your name';
		}	
	}	
}






