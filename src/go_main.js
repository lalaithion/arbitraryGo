function main() {
  var elem = document.getElementById('goBoard');
  var two = new Two({
    width: 700,
    height: 700,
  }).appendTo(elem);
  var ref = elem.children[0].getBoundingClientRect();

  var board = new Board(7, 700, 0);

  elem.onmousemove = function (event) {
    ref = elem.children[0].getBoundingClientRect();
    board.setCurrent(event.clientX - ref.left, event.clientY - ref.top);
  };

  elem.onmousedown = function (event) {
    ref = elem.children[0].getBoundingClientRect();
    board.play(event.clientX - ref.left, event.clientY - ref.top);
    document.getElementById('score').innerHTML = board.score();
  };

  document.getElementById('newRandom').onclick = function () {
    board = new Board(7, 700, 0);
  };

  document.getElementById('newSquare').onclick = function () {
    board = new Board(7, 700, 1);
  };

  document.getElementById('newHex').onclick = function () {
    board = new Board(7, 700, 2);
  };

  document.getElementById('pass').onclick = function () {
    board.pass();
  };

  two.bind('update', function (frameCount) {
    two.clear();
    board.draw(two);
  }).play();
}
