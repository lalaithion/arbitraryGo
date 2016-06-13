class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.color = 'grey';
        this.player = 0;
        this.size = 8;
        this.edges = [];
        this.liberty = false;
        this.owned = -1;
    }
    update(player) {
        if(player === 0) {
            this.player = 0;
            this.color = 'grey';
            this.size = 8;
        } else if(player === 1) { 
            this.player = 1;
            this.color = 'black';
            this.size = 24;
        } else if(player === 2) { 
            this.player = 2;
            this.color = 'white';
            this.size = 24;
        }
    }
    addedge(other) {
        if (this.edges.indexOf(other) === -1) {
            this.edges.push(other);
        }
    }
    draw(two,player) {
        if(player == undefined) {
            var circle = two.makeCircle(this.x,this.y,this.size);
            circle.fill = this.color;
            circle.linewidth = 2;
        } else if(player == 1 && this.player == 0) {
            var circle = two.makeCircle(this.x,this.y,24);
            circle.fill = 'black';
            circle.linewidth = 2;
        } else if(player == 2 && this.player == 0) {
            var circle = two.makeCircle(this.x,this.y,24);
            circle.fill = 'white';
            circle.linewidth = 2;
        } else {
            var circle = two.makeCircle(this.x,this.y,this.size);
            circle.fill = this.color;
            circle.linewidth = 2;
        }
    }
    distance(other) {
        var dx = this.x - other.x;
        var dy = this.y - other.y;
        return Math.sqrt((dx * dx) + (dy * dy));
    }
    explore() {
        for (var i = 0; i < this.edges.length; i++) {
            var sameplayer = this.edges[i].player == this.player;
            var unexplored = !this.edges[i].liberty;
            if (sameplayer && unexplored) {
                this.edges[i].liberty = true;
                this.edges[i].explore;
            }
        }
    }
    ownership() {
        
    }
}

class Edge {
    constructor(alpha,beta) {
        this.alpha = alpha;
        this.beta = beta;
        this.color = 'black';
    }
    draw(two) {
        var line = two.makeLine(this.alpha.x, this.alpha.y, this.beta.x, this.beta.y);
        line.stroke = this.color;
        line.linewidth = 2;
    }
}

class Board {
    constructor(size,dim,layout) {
        this.points = [];
        if (layout == 0) {
        	this.generateRandomPoints(size,dim);
        } else if (layout == 1) {
        	this.generateSquarePoints(size,dim);
        } else if (layout == 2) {
            this.generateHexPoints(size,dim);
        }
        this.edges = [];
        this.generateEdges(size,dim);
        this.fill();
        this.turn = 1;
        this.lastmove = null;
        this.current = -1;
    }
    generateRandomPoints(size,dim) {
    	this.sparsity = 0.5
    	var square = false;
        var center = new Point(size/2.0, size/2.0);
        var firstpoint = new Point((Math.random()*(size-3))+1.5, Math.random()*(size-3)+1.5);
        var temppoints = [firstpoint];
        var activepoints = [firstpoint];
        while (activepoints.length > 0) {
            var test = activepoints[Math.floor(Math.random()*activepoints.length)];
            var sucess = false;
            for (var i = 0; i < 10; i++) {
                var r = (Math.random()*0.5) + 0.5;
                var t = Math.random()*2*Math.PI;
                var x = Math.cos(t)*r + test.x;
                var y = Math.sin(t)*r + test.y;
                var p = new Point(x,y);
                var valid = true;
                if(square) {
                    if (x > size-0.5 || x < 0.5) {
                        continue;
                    }
                    if (y > size-0.5 || y < 0.5) {
                        continue;
                    }
                } else {
                    if (p.distance(center) > (size/2.0)-0.5) {
                        continue;
                    }
                }
                for (var j = 0; j < temppoints.length; j++) {
                    if (temppoints[j].distance(p) < 0.5) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    sucess = true;
                    activepoints.push(p);
                    temppoints.push(p);
                    break;
                }
            }
            if (!sucess) {
                var index = activepoints.indexOf(test);
                if (index > -1) {
                    activepoints.splice(index, 1);
                }
            }
        }
        for(var i = 0; i < temppoints.length; i++) {
            var x = temppoints[i].x;
            var y = temppoints[i].y;
            x = dim*(x/size);
            y = dim*(y/size);
            this.points.push(new Point(x,y));
        }
    }
    generateSquarePoints(size,dim) {
    	this.sparsity = 1.0;
    	var temppoints = [];
    	var row = .9;
    	var column = .9;
    	while (temppoints.length < size*size) {
    		temppoints.push(new Point(row,column));
    		if (row >= size-2.0) {
    			column += .8;
    			row = .9;
    		} else {
    			row += .8;
    		}
    	}
    	for(var i = 0; i < temppoints.length; i++) {
            var x = temppoints[i].x;
            var y = temppoints[i].y;
            x = dim*(x/size);
            y = dim*(y/size);
            this.points.push(new Point(x,y));
        }
    }
    generateHexPoints(size,dim) {
        this.sparsity = 1.0;
        var temppoints = []
        var startx = 0.5*size;
        var starty = 0.5*size;
        temppoints.push(new Point(startx,starty));
        var directions = [[Math.cos(0),Math.sin(0)],
                         [Math.cos(Math.PI/3),Math.sin(Math.PI/3)],
                         [Math.cos(2*Math.PI/3),Math.sin(2*Math.PI/3)],
                         [Math.cos(Math.PI),Math.sin(Math.PI)],
                         [Math.cos(4*Math.PI/3),Math.sin(4*Math.PI/3)],
                         [Math.cos(5*Math.PI/3),Math.sin(5*Math.PI/3)]];
        var current = 0;
        while (current < temppoints.length) {
            var cpoint = temppoints[current];
            for (var i = 0; i < directions.length; i++) {
                var d = directions[i];
                var good = true;
                var candidate = new Point(cpoint.x + d[0], cpoint.y + d[1]);
                if (temppoints[0].distance(candidate) > (size/2)-0.1) {
                    continue;
                }
                for (var j = 0; j < temppoints.length; j++) {
                    if (temppoints[j].distance(candidate) < 0.001*size) {
                        good = false;
                        break;
                    }
                }
                if (good) {
                    temppoints.push(candidate);
                }
            }
            current += 1;
        }
        for(var i = 0; i < temppoints.length; i++) {
            var x = temppoints[i].x;
            var y = temppoints[i].y;
            x = dim*(x/size);
            y = dim*(y/size);
            this.points.push(new Point(x,y));
        }
    }
    generateEdges(size,dim) {
        for (var i = 0; i < this.points.length; i++) {
            var possible = [];
            for (var j = 0; j < this.points.length; j++) {
                if (this.points[i].distance(this.points[j]) < (dim/size)+1 && i != j) {
                    possible.push(new Edge(this.points[i],this.points[j]));
                }
            }
            for (var j = 0; j < possible.length; j++) {
                if (Math.random() < this.sparsity) {
                    this.edges.push(possible[j]);
                }
            }
        }
    }
    fill() {
        for(var i = 0; i < this.edges.length; i++) {
            this.edges[i].alpha.addedge(this.edges[i].beta);
            this.edges[i].beta.addedge(this.edges[i].alpha);
        }
        for(var i = 0; i < this.points.length; i++) {
            if (this.points[i].edges.length == 0) {
                this.points.splice(i,1);
            }
        }
    }
    setCurrent(x,y) {
        var pos = new Point(x,y);
        var min = 0;
        for(var i = 0; i < this.points.length; i++) {
            if (pos.distance(this.points[i]) < pos.distance(this.points[min])) {
                min = i;
            }
        }
        this.current = min;
    }
    play(x,y) {
        this.setCurrent(x,y);
        if (this.points[this.current].player == 0) {
            this.points[this.current].update(this.turn);
            if (this.turn == 1) { this.turn = 2; }
            else if (this.turn == 2) { this.turn = 1; }
        }
        this.capture();
    }
    draw(two) {
        for(var i = 0; i < this.edges.length; i++) {
            this.edges[i].draw(two);
        }
        for(var i = 0; i < this.points.length; i++) {
            if(i == this.current) {
                this.points[i].draw(two,this.turn);
            } else {
                this.points[i].draw(two);
            }
        }
    }
    capture(first=true) {
        for(var i = 0; i < this.points.length; i++) {
            this.points[i].liberty = false;
        }
        for(var i = 0; i < this.points.length; i++) {
            if (this.points[i].player == 2 || this.points[i].player == 1) {
                if (i == this.current && first) {
                    this.points[i].liberty = true;
                    continue;
                }
                for(var j = 0; j < this.points[i].edges.length; j++) {
                    if (this.points[i].edges[j].player == 0) {
                        this.points[i].liberty = true;
                        break;
                    }
                }
            }
        }
        for(var i = 0; i < this.points.length; i++) {
            if (this.points[i].liberty) {
                this.points[i].explore();
            }
        }
        for(var i = 0; i < this.points.length; i++) {
            if (this.points[i].liberty == false) {
                this.points[i].update(0);
            }
        }
        if (first) {
            this.capture(false)
        }
    }
    score() {
    	return String(Math.random());
    }
}

function main() {
    var elem = document.getElementById('goBoard');
    var two = new Two({ width: 700, height: 700 }).appendTo(elem);
    var ref = elem.children[0].getBoundingClientRect();

    var board = new Board(7,700,0);

    console.log(board);

    elem.onmousemove = function(event) { 
        ref = elem.children[0].getBoundingClientRect(); 
        board.setCurrent(event.clientX-ref.left, event.clientY-ref.top); 
    };

    elem.onmousedown = function(event) { 
        ref = elem.children[0].getBoundingClientRect();
        board.play(event.clientX-ref.left, event.clientY-ref.top);
        document.getElementById('score').innerHTML = board.score();
    };

    document.getElementById('newRandom').onclick = function () {
    	board = new Board(7,700,0);
    }

    document.getElementById('newSquare').onclick = function () {
    	board = new Board(7,700,1);
    }

    document.getElementById('newHex').onclick = function () {
    	board = new Board(7,700,2)
    }

    two.bind('update', function(frameCount) {
        two.clear();
        board.draw(two);
    }).play();
}