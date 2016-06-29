class Set {
  //This is a simple set class that contains an array with adding and existence
  //testing which does not allow for duplicates. This homebrew is preferred
  //over relying on a inconsistenly created and applied standard.
  constructor() {
    this.data = [];
  }

  add(item) {
    if (this.data.indexOf(item) == -1) {
      this.data.push(item);
    }
  }

  exists(item) {
    if (this.data.indexOf(item) == -1) {
      return false;
    }

    return true;
  }
}

class Point {
  //This class represents a point on the board which can be played on by either
  //player
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = 'grey';
    this.player = 0;
    this.size = 8;
    this.edges = [];
    this.liberty = false;
    this.owned = -1;
  }

  //This method updates who is occupying this point
  update(player) {
    if (player === 0) {
      this.player = 0;
      this.color = 'grey';
      this.size = 8;
    } else if (player === 1) {
      this.player = 1;
      this.color = 'black';
      this.size = 24;
    } else if (player === 2) {
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

  //This method draws the point on the canvas provided by the first argument
  //with an option for drawing it as being a certain players if the space
  //is already blank
  draw(two, player) {
    if (player == undefined) {
      var circle = two.makeCircle(this.x, this.y, this.size);
      circle.fill = this.color;
      circle.linewidth = 2;
    } else if (player == 1 && this.player == 0) {
      var circle = two.makeCircle(this.x, this.y, 24);
      circle.fill = 'black';
      circle.linewidth = 2;
    } else if (player == 2 && this.player == 0) {
      var circle = two.makeCircle(this.x, this.y, 24);
      circle.fill = 'white';
      circle.linewidth = 2;
    } else {
      var circle = two.makeCircle(this.x, this.y, this.size);
      circle.fill = this.color;
      circle.linewidth = 2;
    }
  }

  //This method returns the distance between two points
  distance(other) {
    var dx = this.x - other.x;
    var dy = this.y - other.y;
    return Math.sqrt((dx * dx) + (dy * dy));
  }

  //This method is used to figure out if a group of pieces have a liberty or not
  //TODO: This doesn't actually work quite right
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

  //This method is used to figure out which groups of blank spaces is
  //surrounded by a player
  //TODO: This doesn't work at all
  ownership() {
    var neighbors = new Set();
    for (var i = 0; i < this.edges.length; i++) {
      var empty = this.edges[i].player == 0;
      var unexplored = this.edges[i].owned == -1;
      console.log(empty);
      console.log(unexplored);
      if (empty && unexplored) {
        this.edges[i].owned = -2;
        var metaneigh = this.edges[i].ownership();
        for (var j = 0; j < metaneigh.data.length; j++) {
          neighbors.add(metaneigh.data[j]);
        }
      }

      if (!empty) {
        neighbors.add(this.edges[i].player);
      }
    }

    return neighbors;
  }
}

class Edge {
  //This class represents an edge between two points
  constructor(alpha, beta) {
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
