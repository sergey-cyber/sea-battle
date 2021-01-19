
const body = document.getElementsByTagName('body');
const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	const setFieldsSize = () => {
		let cellSize;
		if(body[0].clientWidth > 1300) {
			cellSize = 40;
		} else if(body[0].clientWidth < 850) {
			cellSize = 23;
		} else {
			cellSize = 25;
		}
		return cellSize;
	}
	let cellSize =  setFieldsSize();
	const width = canvas.width = cellSize*24;
    const height = canvas.height = cellSize*11;
    
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
    
    const drawRect = (x, y, size, color) => {
		ctx.fillStyle = color;
		ctx.fillRect(x, y, size, size);	
	}
	
	drawPlayingFields(cellSize);