class Set {
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
    var neighbors = new Set();
    for (var i = 0; i < this.edges.length; i++) {
      var empty = this.edges[i].player == 0;
      var unexplored = this.edges.owned == -1;
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
