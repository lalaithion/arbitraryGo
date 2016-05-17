class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.color = 'grey';
        this.player = 0;
        this.size = 8;
        this.edges = [];
        this.liberty = false;
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
        this.generatePoints(size,dim,false);
        this.edges = [];
        this.generateEdges(size,dim);
        this.fill();
        this.turn = 1;
        this.lastmove = null;
        this.current = -1;
    }
    generatePoints(size,dim,square=true) {
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
    }
    play(x,y) {
        this.setCurrent(x,y);
        if (this.points[this.current].player == 0) {
            this.points[this.current].update(this.turn);
            if (this.turn == 1) { this.turn = 2; }
            else if (this.turn == 2) { this.turn = 1; }
        }
        console.log(this.points[this.current].edges.length);
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
}

function main() {
    var elem = document.getElementById('goBoard');
    var two = new Two({ type: Two.Types.webgl, width: 700, height: 700 }).appendTo(elem);

    var board = new Board(7,700);

    console.log(board);

    var x,y;
    elem.onmousemove = function(event) { board.setCurrent(event.offsetX,event.offsetY); };
    elem.onclick = function(event) { board.play(event.offsetX,event.offsetY); };

    two.bind('update', function(frameCount) {
        two.clear();
        board.draw(two);
    }).play();
}