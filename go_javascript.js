class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.color = 'grey';
        this.player = 0;
        this.size = 8;
        this.edges = [];
    }
    update(player) {
        if(player === 0) {
            this.player = 0;
            this.color = 'grey';
            this.size = 8;
        } else if(player === 1) { 
            this.player = 1;
            this.color = 'black';
            this.size = 32;
        } else if(player === 2) { 
            this.player = 2;
            this.color = 'white';
            this.size = 32;
        }
    }
    addedge(other) {
        if (this.edges.indexOf(other) === -1) {
            this.edges.push(other);
        }
    }
    draw(two,player) {
        var circle = two.makeCircle(this.x,this.y,this.size);
        if (this.player == 0) {
            if (player == 1) {
                circle.fill = 'black';
            } else if (player == 2) {
                circle.fill = 'white';
            } else {
                circle.fill = 'grey';
            }
        }
        else {
            circle.fill = this.color;
        }
        circle.linewidth = 2;
    }
    distance(other) {
        var dx = this.x - other.x;
        var dy = this.y - other.y;
        return Math.sqrt((dx * dx) + (dy * dy));
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
    constructor(size,dim) {
        this.points = [];
        this.generatePoints(size,dim);
        this.edges = [];
        this.generateEdges(size,dim);
        this.fill();
        this.turn = 1;
        this.lastmove = null;
        this.current = -1;
    }
    generatePoints(size,dim,square=true) {
        var center = new Point(size/2.0, size/2.0);
        var firstpoint = new Point((Math.random()*(size-1))+0.5, Math.random()*(size-1)+0.5);
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
                    if (p.distance(center) > size/2.0) {
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
    generateEdges(size,dim) {
        for (var i = 0; i < this.points.length; i++) {
            var possible = [];
            for (var j = 0; j < this.points.length; j++) {
                if (this.points[i].distance(this.points[j]) < (dim/size) && i != j) {
                    possible.push(new Edge(this.points[i],this.points[j]));
                }
            }
            for (var j = 0; j < possible.length; j++) {
                if (Math.random() > 0.5) {
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
        console.log(this.current);
    }
    draw(two) {
        console.log(this.current)
        for(var i = 0; i < this.edges.length; i++) {
            this.edges[i].draw(two);
        }
        for(var i = 0; i < this.points.length; i++) {
            if (i == this.current) {
                this.points[i].draw(two,this.turn);
            }
            this.points[i].draw(two);
        }
    }
}

function main() {
    var elem = document.getElementById('goBoard');
    var two = new Two({ type: Two.Types.webgl, width: 700, height: 700 }).appendTo(elem);

    var board = new Board(5,700);

    console.log(board);

    board.draw(two)
    two.update();
}