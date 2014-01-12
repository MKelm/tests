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

  requestAnimFrame(animate);
  function animate() {
    renderer.render(stage);
    requestAnimFrame(animate);
  }
  function initScreen() {
    screen.width = window.innerWidth;
    screen.height = window.innerHeight;
    mazeGfx.position = {
      x: screen.width / 2, y: screen.height / 2
    };
    makeMaze();
  }

  function isChance(p, max) {
    if (typeof max == "undefined") max = 32767;
    var r = Math.random() * max;
    return r < (max * p)
  }

  function makeMaze() {
    var fieldSize = 10;
    var mazeSize = { width: screen.width / fieldSize, height: screen.height / fieldSize };
    var mazeFields = [];
    for (var y = 0; y < mazeSize.height; y++) {
      mazeFields[y] = [];
      for (var x = 0; x < mazeSize.width; x++) {
        mazeFields[y][x] = (isChance(0.4)) ? 1 : 0;
      }
    }

    // draw maze
    mazeGfx.clear();
    mazeGfx.beginFill(0xFFFFFF);
    var offsetX = -1 * mazeSize.width * fieldSize / 2,
        offsetY = -1 * mazeSize.height * fieldSize / 2;
    for (var y = 0; y < mazeFields.length; y++) {
      for (var x = 0; x < mazeFields[y].length; x++) {
        if (mazeFields[y][x] == 1)
          mazeGfx.drawRect(offsetX + x * fieldSize, offsetY + y * fieldSize, fieldSize, fieldSize);
      }
    }
    mazeGfx.endFill();

  }

  makeMaze();

});