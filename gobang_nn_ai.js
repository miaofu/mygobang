function Single_NN(rows,cols){
	this.rows=rows;
	this.cols=cols;
	
	
    var layer_defs = [];
    layer_defs.push({type:'input', out_sx:this.rows, out_sy:this.cols, out_depth:1});
    layer_defs.push({type:'conv', sx:5, filters:8, stride:1, pad:2, activation:'relu'});
    layer_defs.push({type:'pool', sx:2, stride:2});
    layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
    layer_defs.push({type:'pool', sx:3, stride:3});
    layer_defs.push({type:'softmax', num_classes:this.rows*this.cols});
	this.layer_defs=layer_defs;
	
	
	
	this.createNNAI();
	/*
	net = createNNAI();
	printOutput(net);
	alert(getPrediction(net,rows,cols));
	*/
	
}

//Sinqle_NN.prototype.gobang=new Gobang(document.getElementById("gobang"));

Single_NN.prototype = {
	createNNAI: function(){
		var net = new convnetjs.Net();
        net.makeLayers(this.layer_defs);
        var pglist = net.getParamsAndGrads();
        for(var i=0;i<pglist.length;i++) {
               var pg = pglist[i]; // param, gradient, other options in future (custom learning rate etc)
               var p = pg.params;
		       var plen = p.length;
               for(var j=0;j<plen;j++) {
				   p[j]=0.2*Math.random();
			    }
		}
		this.net =net;
		return net;
	},
    update_data: function(grid){
       	this.grid=grid;
        data = new convnetjs.Vol(this.rows,this.cols,1);
        for(var row=0;row<this.rows;row++){
	        for(var col=0;col<this.cols;col++){
		        data.set(row,col,1,this.grid[row][col]+1);
				}
		}
        this.data=data;	
		this.output = this.net.forward(this.data);
    },
    
    printOutput: function(){
		for(var i=0;i<this.output.w.length;i++){
			document.writeln(this.output.w[i]);
		}
	},
	getPrediction: function(){
		output = this.output;
		grid  =this.grid;
		//document.writeln(grid);
		max_w=-1;
		max_i=-1;
		for(var i=0;i<output.w.length;i++){
			 var tmp_r= Math.floor(i/this.cols);
			 var tmp_c=i-tmp_r*this.cols;
			 if (grid[tmp_r][tmp_c]!=-1){
				 continue;
			 }
			 if(output.w[i]>max_w){
				 max_w=output.w[i];
				 max_i=i;
			 }
		}
		var r = Math.floor(max_i/this.cols);
		var c = max_i-r*this.cols
		return [r,c];
	},
	getResultWithOpp: function(moves,iswin){
		this.result_moves=moves;
		this.result_len=moves.length/2;
		this.is_win=iswin;
		this.score = this.is_win*100+this.result_len;//如果赢了，加100倍
	},
	ExecuteCompete: function(gobang,isdraw){
		gobang.AI2AI(this,isdraw);
	    gobang.printMessage('is_win:'+this.is_win+', Expoch: '+this.result_len);
	}
	
};
	

function Spiece(N,rows,cols){
	
	this.N=N;
	this.rows=rows;
	this.cols=cols;

	spiece = [];
	for(var i =0;i<N;i++){
		spiece.push(new Single_NN(rows,cols));
		
	}
	this.gene = spiece;
	
	this.logDOM = document.getElementById("GA_log");
	
	this.pmute=0.1;
    alert("Spiece");    
};

Spiece.prototype={
	printMessage: function(message){
		var li = document.createElement("li");
		var t = document.createTextNode(message);
		li.appendChild(t);
		this.logDOM.appendChild(li);
	},
	//getAvgFit=1
	ExecuteCompete: function(gobang,isdraw){
		for(var i=0;i<this.N;i++){
		    individual = this.gene[i];
		    individual.ExecuteCompete(gobang,isdraw);
	    }
	},
	
	getStatFit: function(){
		//统计量
		this.printMessage("get Stat For the Spiece");
		var score_array=new Array(this.N);
		for(var i=0;i<this.N;i++){
			score_array[i]=this.gene[i].score;
		}
		this.score_array=score_array;
		this.AvgFit=0;
		for(var i=0;i<this.N;i++){
			this.AvgFit+=score_array[i]/this.N;
		}
		this.MaxFit=0;
		this.MaxFitIndex=-1;
		for(var i=0;i<this.N;i++){
			if(this.score_array[i]>this.MaxFit){
				this.MaxFit=this.score_array[i];
				this.MaxFitIndex = i;
			}
		}
		this.MinFit=0;
		this.MinFitIndex=-1;
		for(var i=0;i<this.N;i++){
			if(this.score_array[i]<this.MinFit){
				this.MinFit=this.score_array[i];
				this.MinFitIndex = i;
			}
		}
		this.printMessage("Fit Distribution:" + score_array.toString());
		this.printMessage("Avgage:"+this.AvgFit+", Max: "+this.MaxFit);
	},
	
	//种群演化
	GA_Selection: function(){
		
		var fitNormal=new Array(this.N);
		for(var i=0;i<this.N;i++){
			fitNormal[i]=this.score_array[i]/this.AvgFit/this.N;
		}
		var rp = Math.random();
		var down=0;
		var up=0;
		for(var i=0;i<this.N;i++){
			up =down+fitNormal[i];
			if ((rp>down)&&(rp<up)){ // 这个之前有个bug.
				return  i;
			}
			down =up;
		}
		return this.MaxFitIndex;
	},
	
	GA_CrossOver: function(){
		//this.printMessage("GA CrossOver Start");
		father_index = this.GA_Selection();
		mother_index = this.GA_Selection();
		this.printMessage("<GA CrossOver>Father Index: "+father_index+", Mother Index: "+mother_index+"<GA CrossOver>");
		father = this.gene[father_index];
		mother = this.gene[mother_index];
		
		child        = new Single_NN(this.rows,this.cols);
		var child_brain        =child.net.getParamsAndGrads(); 
		var father_brain =father.net.getParamsAndGrads();
		var mother_brain =mother.net.getParamsAndGrads();
        for(var i=0;i<child_brain.length;i++) {
               var pg_child = child_brain[i]; // param, gradient, other options in future.
               var p_child = pg_child.params;
			   var pg_father = father_brain[i]; // param, gradient, other options in future.
               var p_father = pg_father.params;
			   var pg_mother = mother_brain[i]; // param, gradient, other options in future.
               var p_mother = pg_mother.params;
		       var plen = p_child.length;
			   //this.printMessage("plen: "+plen);
               if (Math.random()>0.5){
			        p_child = p_father;}
	           else{
	            	p_child = p_mother;}
		}
		return child;
	},
	GA_Mute: function(){
		// 对种群中每一个个体进行变异
		this.printMessage("GA Mute");
		for(var i=0;i<this.N;i++){
			individual = this.gene[i];
			brain = individual.net.getParamsAndGrads();
			for(var i=0;i<brain.length;i++) {
               var pg = brain[i]; // param, gradient, other options in future.
               var p = pg.params;
		       var plen = p.length;
               for(var j=0;j<plen;j++) {
				    if (Math.random()<this.pmute){
					    p[j]=0.2*Math.random();}
			    }
		    }
		    this.gene[i]= individual;
		}
	},
	
	GA: function(gobang,isdraw){
		
		this.printMessage("Genetic Algorthm Start!");
		
		for(var Generation=1;Generation<5;Generation++){
		   this.printMessage("Generation: "+Generation);
		   var Gene = new Array(this.N);
		   this.ExecuteCompete(gobang,isdraw);
		   this.getStatFit();
		   MaxGene= this.gene[this.MaxFitIndex];
	       for(var i=0;i<this.N-1;i++){
			  child = this.GA_CrossOver();
			  Gene[i] = child;
		   }
		   Gene[this.N-1]=MaxGene;
		   this.gene=Gene;
		   this.GA_Mute();
		}
		
	}
	
};

function GA(){
	
}