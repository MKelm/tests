$(document).ready(function() {

  var screen = {};
  var stage = new PIXI.Stage(0x777777, false); // interactive

  var mazeGfx = new PIXI.Graphics();
  mazeGfx.anchor = { x: 0.5, y: 0.5 };
  stage.addChild(mazeGfx);

  initScreen();
  var renderer = PIXI.autoDetectRenderer(
    screen.width, screen.height, null, false // transparency
  );

  $(window).resize(function() {
    initScreen();
    mazeGfx.position = {
      x: screen.width / 2, y: screen.height / 2
    };
    renderer.resize(screen.width, screen.height);
  });

  $("body").append(renderer.view);

  function initScreen() {
    screen.width = window.innerWidth;
    screen.height = window.innerHeight;
    mazeGfx.position = {
      x: screen.width / 2, y: screen.height / 2
    };
  }

  function makeMaze() {
    var fieldSize = 10;
    var mazeSize = Math.min(Math.round(screen.width / fieldSize), Math.round(screen.height / fieldSize));
    if (mazeSize > 90) mazeSize = 90;

    var mazeFields = newMaze(mazeSize, mazeSize);

    // draw maze
    mazeGfx.clear();
    mazeGfx.beginFill(0xFFFFFF);
    mazeGfx.lineStyle(2, 0xFFFFFF);
    var offsetX = -1 * mazeSize / 2 * fieldSize,
        offsetY = -1 * mazeSize / 2 * fieldSize;

    for (var y = 0; y < mazeFields.length; y++) {
      for (var x = 0; x < mazeFields[y].length; x++) {

        if (mazeFields[y][x][0] == 0) { // top wall
          mazeGfx.moveTo(offsetX + x * fieldSize, offsetY + y * fieldSize);
          mazeGfx.lineTo(offsetX + x * fieldSize + fieldSize, offsetY + y * fieldSize);
        }
        if (mazeFields[y][x][1] == 0) { // right wall
          mazeGfx.moveTo(offsetX + x * fieldSize + fieldSize, offsetY + y * fieldSize);
          mazeGfx.lineTo(offsetX + x * fieldSize + fieldSize, offsetY + y * fieldSize + fieldSize);
        }
        if (mazeFields[y][x][2] == 0) { // bottom wall
          mazeGfx.moveTo(offsetX + x * fieldSize, offsetY + y * fieldSize + fieldSize);
          mazeGfx.lineTo(offsetX + x * fieldSize + fieldSize, offsetY + y * fieldSize + fieldSize);
        }
        if (mazeFields[y][x][3] == 0) { // left wall
          mazeGfx.moveTo(offsetX + x * fieldSize, offsetY + y * fieldSize);
          mazeGfx.lineTo(offsetX + x * fieldSize, offsetY + y * fieldSize + fieldSize);
        }
      }
    }
    mazeGfx.endFill();

  }

  makeMaze();
  renderer.render(stage);

});