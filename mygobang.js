function Gobang(canvasDOM, rows, cols) {
	// 第一个函数Canvas 绘图棋盘
	this.rows = rows ? rows : 15;
    this.cols = cols ? cols : 15;
	this.canvasDOM=canvasDOM;
    this.canvas = canvasDOM.getContext("2d");
    this.canvasWidth = canvasDOM.width;
	this.canvasHeight= canvasDOM.height;
	this.cellWidth = this.canvasWidth / (this.cols + 1);
    this.cellHeight = this.canvasHeight / (this.rows + 1);
    this.inBoard = function (row, col) {
        return row >= 0 && col >= 0 && row < this.rows && col < this.cols;
    }
    
    

    this.currentPlayer = 0;// 白子先行。
    this.moves = [];
	//this.moves.push([1,1]);
    //this.moves.push([1,5]);
    this.grid = new Array(this.rows);
    for (var i = 0; i < this.rows; i++) 
        this.grid[i] = new Array(this.cols);
    for (var i = 0; i < this.rows; i++)
            for (var j = 0; j < this.cols; j++)
                this.grid[i][j] = -1;
    this.enableAI = true;
    this.hardness = 2;
	this.logDOM = document.getElementById("log");
	this.drawBackground();
	this.drawStonePool(0);
			
	ctx=this.canvas;
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(canvasDOM.width,0);
	ctx.lineTo(canvasDOM.width,canvasDOM.height);
	ctx.lineTo(0,canvasDOM.height);
	ctx.closePath();
	ctx.strokeStyle = "rgba(255,0,0,0.5)";
	ctx.lineWidth=20;
	ctx.stroke();
	
	// 
	
	
	var px = document.getElementById('px');
    function pick(event) {
             var x = event.layerX;
             var y = event.layerY;
             px.style.background =  "#f00";
             px.textContent = 'X='+x+', Y='+y;
    }
    canvasDOM.addEventListener('mousemove', pick);
	this.px=px;
	
	position = document.getElementById('position');
	position.style.background =  "#f00";
	this.position=position;
	var AI_Position = document.getElementById('AI');
	AI_Position.style.background =  "#0f0";
	this.AI_Position=AI_Position;
};
Gobang.prototype = {
	printMessage: function(message){
	    	var li = document.createElement("li");
			var t = document.createTextNode(message);
			li.appendChild(t);
			this.logDOM.appendChild(li);
	},
	drawBackground: function() {
		    //this.logDOM.firstChild.nodeValue+="use drawBackground";
		    this.printMessage("Use drawBackground");	
            this.canvas.fillStyle = "rgb(208, 141, 47)";
            this.canvas.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.canvas.fillStyle = "#000000";
            this.canvas.beginPath();
            var cellWidth = this.canvasWidth / (this.cols + 1);
            var cellHeight = this.canvasHeight / (this.rows + 1);
            for (var i = 1; i <= this.cols; i++) {
                this.canvas.moveTo(cellWidth * i, cellHeight);
                this.canvas.lineTo(cellWidth * i, this.canvasHeight - cellHeight);
            }
            for (var i = 1; i <= this.rows; i++) {
                this.canvas.moveTo(cellWidth, cellHeight * i);
                this.canvas.lineTo(this.canvasWidth - cellWidth, cellHeight * i);
            }
            this.canvas.closePath();
            this.canvas.stroke();
        },
	drawStonePool: function(currentPlayer) {
		    this.printMessage("Use drawStonePool");
			var cellWidth = this.canvasWidth / (this.cols + 1);
            var cellHeight = this.canvasHeight / (this.rows + 1);
			
            var white = (currentPlayer == 0);
            var radius = cellWidth + cellHeight;
            radius /= 4;
            this.canvas.fillStyle = white ? '#fff' : '#000';
            for (var i = this.moves.length - 1; i >= 0; i--) {
			
                this.canvas.fillStyle = currentPlayer == 0 ? "#000" : "#fff";
                this.canvas.beginPath();
				
                this.canvas.arc(this.moves[i][1] * cellWidth + cellWidth,
                        this.moves[i][0] * cellHeight + cellHeight,
                        radius, 0, 2 * Math.PI,true);
                
                this.canvas.fill();
			
                currentPlayer = 1 - currentPlayer;
                //如果是上一个对手的move,则在加上一个红心小圆圈。
                if (i == this.moves.length - 1) {
                    this.canvas.fillStyle = "#f00";
                    this.canvas.beginPath();
                    this.canvas.arc(
                            this.moves[i][1] * cellWidth + cellWidth,
                            this.moves[i][0] * cellHeight + cellHeight, 
                            3, 0, 2 * Math.PI);
                    this.canvas.closePath();
                    this.canvas.fill();
                }
            }
        },
	CheckOver: function(grid,currentPlayer){
		dir_set=[[0,1],[1,0],[1,1],[1,-1]];
		for (var row = 0; row < this.rows; row++){
             for (var col = 0; col < this.cols; col++){
                if (grid[row][col] ==currentPlayer){
				    
                    for(var angle=0; angle <= 3; angle+=1) {
						var cnt = 1;// 以上面四个方向任意一个满足5个连线，就返回true
						dir_x=dir_set[angle][0];
						dir_y=dir_set[angle][1];
                        for (var l = 1; l <= 4; l++) {
                            newrow = row + dir_x  * l; 
                            newcol = col + dir_y  * l;
							
                            if (this.inBoard(newrow, newcol) && currentPlayer == grid[newrow][newcol])
							{cnt++;}
                            else{
                                  break;
							}
							newrow = row + dir_x  * l*(-1); 
                            newcol = col + dir_y  * l*(-1);
							if (this.inBoard(newrow, newcol) && currentPlayer == grid[newrow][newcol])
							   {cnt++;}
                            else{
                                  break;
							}
                            if (cnt == 5){
                                return true;
							}
                        }
					}
                }
			}
		}
        return false; 	
 	},
	AI2Human: function(){
		this.printMessage("Use AI2Human");
		game=this;
		nn_ai=new Single_NN(game.rows,game.cols);
        nn_ai.createNNAI();
	
		epoch=0;
		var readMove=function (event) {
             var x = event.layerX;
             var y = event.layerY;
			 pos_y=Math.round((x-408)/game.cellWidth)-1;
			 pos_x=Math.round((y-185)/game.cellHeight)-1;
			 
			 game.position.textContent = 'human pos:'+pos_x+', '+pos_y;
			 game.moves.push([pos_x,pos_y]);
			 game.grid[pos_x][pos_y]=0;
			 
			if (game.CheckOver(game.grid,0)){
				 alert('White WIN!!!!');
		    }
			//alert(game.moves); 
			 
			 ret = AI.play(game.grid, game.currentPlayer, game.hardness);
			 AI_x=ret[1][0];
			 AI_y=ret[1][1];
			 
			 /*
	         nn_ai.update_data(game.grid);
	         g=nn_ai.getPrediction();
             AI_x=g[0];
			 AI_y=g[1];
			 */
			 game.AI_Position.textContent = 'AI pos:'+AI_x+', '+AI_y;
			 game.moves.push([AI_x,AI_y]);
			 game.grid[AI_x][AI_y]=1;
			 game.drawStonePool(0);
			 epoch++;
	         game.printMessage("epoch"+epoch+':Your(Human) pos:('+pos_x+', '+pos_y+')    ;AI pos:('+AI_x+', '+AI_y+")");
			 if (game.CheckOver(game.grid,1)){alert('Black WIN!!!!');}
        
        };
		this.canvasDOM.addEventListener('mousedown', readMove);
	},
	
	AI2AI: function(nn_ai,isdraw){
		this.moves=[];
		for(var i=0;i<this.rows;i++){
			for(var j=0;j<this.cols;j++){
				this.grid[i][j]=-1;
			}
		}
		if(isdraw)this.printMessage("AI2AI Start.White is Nerual Network,Black is ruled based AI");
		//nn_ai=nn_ai?nn_ai:new Single_NN(this.rows,this.cols);
        //nn_ai.createNNAI();
		for(var epoch =1;epoch<40;epoch++){
			 //alert(epoch);
			 
			 
	         nn_ai.update_data(this.grid);
	         g=nn_ai.getPrediction();
			 //alert(g);
             pos_x=g[0];
			 pos_y=g[1];
			 this.position.textContent = 'NN pos:'+pos_x+', '+pos_y;
		     this.moves.push([pos_x,pos_y]);
			 this.grid[pos_x][pos_y]=0;
			 if (this.CheckOver(this.grid,0)){
				 nn_ai.getResultWithOpp(this.moves,1);
				 if(isdraw)alert('White WIN!!!!');
				 if(isdraw)this.drawStonePool(0);
				 break;
		     } 
			 ret = AI.play(this.grid, this.currentPlayer, this.hardness);
			 AI_x=ret[1][0];
			 AI_y=ret[1][1];
			 //alert([AI_x,AI_y]);
			 
			 this.AI_Position.textContent = 'AI pos:'+AI_x+', '+AI_y;
			 this.moves.push([AI_x,AI_y]);
			 this.grid[AI_x][AI_y]=1;
			 
			 if (this.CheckOver(this.grid,1)){
				 nn_ai.getResultWithOpp(this.moves,0);
				 if(isdraw)alert('Black WIN!!!!');
				 if(isdraw)this.drawStonePool(0);
				 break;
			}
		    if(isdraw)this.printMessage("Epoch"+epoch+': NN pos:('+pos_x+', '+pos_y+')    ; AI pos:('+AI_x+', '+AI_y+")");
			//alert(this.moves);
			if(isdraw)this.drawStonePool(0);
		}
	}
	
}