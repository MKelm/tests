$(document).ready(function() {

  // pixi/display stuff
  var screen = {};
  function initScreen() {
    screen.width = window.innerWidth;
    screen.height = window.innerHeight;
  }
  initScreen();

  var stage = new PIXI.Stage(0x777777, false); // interactive
  var renderer = PIXI.autoDetectRenderer(
    screen.width, screen.height, null, true // transparency
  );

  $(window).resize(function() {
    initScreen();
    renderer.resize(screen.width, screen.height);
  });

  $("body").append(renderer.view);

  function isChance(p, max) {
    if (typeof max == "undefined") max = 32767;
    var r = Math.random() * max;
    return r < (max * p)
  }

  var lastHeroSpawnTryTime = 0, currentTime = 0;
  function animate() {
    renderer.render(stage);
    TWEEN.update();

    currentTime = new Date().getTime();
    if (currentTime - lastHeroSpawnTryTime > 100) {
      lastHeroSpawnTryTime = currentTime;
      heroSpawnTry();
    }
    moveHeroes();
    requestAnimFrame(function() { animate(); });
  }
  requestAnimFrame(function() { animate(); });

  // grid stuff
  var gridSize = { width: 20, height: 20 };
  var gridFieldSize = { width: Math.round(screen.height/gridSize.width), height: Math.round(screen.height/gridSize.height) };
  var pathfindingGrid = new PF.Grid(gridSize.width, gridSize.height);
  var grid = [];
  for (var y = 0; y < gridSize.height; y++) {
    grid[y] = [];
    for (var x = 0; x < gridSize.width; x++) {
      pathfindingGrid.setWalkableAt(x, y, true);
      grid[y][x] = 0;
    }
  }
  // special map positions
  var spawnPoints = [
    { x: 0, y: 0 },
    { x: gridSize.width - 1, y: 0 },
    { x: gridSize.width - 1, y: gridSize.height - 1 },
    { x: 0, y: gridSize.height - 1 }
  ];
  var middlePoint = {x: Math.round(gridSize.width/2), y: Math.round(gridSize.height/2)};

  // heroes stuff
  var heroes = [], maxHeroes = 10;
  function heroSpawnTry() {
    if (isChance(0.3 - (0.3 / maxHeroes * heroes.length))) {
      var position = spawnPoints[Math.round(Math.random() * (spawnPoints.length-1))];
      heroes.push({ position: position });

      var sprite = new PIXI.Sprite(PIXI.Texture.fromImage("hero.png"));
      sprite.width = gridFieldSize.width;
      sprite.height = gridFieldSize.height;
      sprite.position = {
        x: position.x * gridFieldSize.width,
        y: position.y * gridFieldSize.height
      };
      stage.addChild(sprite);
      heroes[heroes.length-1].sprite = sprite;
      heroes[heroes.length-1].movement = false;
    }
  }

  function moveHeroes() {
    for (var i = 0; i < heroes.length; i++) {
      if (heroes[i].movement == false) {
        var behaviour = Math.round(Math.random() * 1);
        if (behaviour == 0) {
          // first behaviour, follow path to middle point
          moveHero(heroes[i], middlePoint);
        } else {
          // second behaviour, follow path to random point
          var distance = 10, angle = Math.round(Math.random() * 360),
              cosAlpha = Math.cos(angle), sinAlpha = Math.sin(angle);
          var targetPoint = {
            x: Math.round(heroes[i].position.x - cosAlpha * distance),
            y: Math.round(heroes[i].position.y - sinAlpha * distance)
          };
          targetPoint.x = (targetPoint.x < 0) ? 0 : (targetPoint.x > gridSize.width-1) ? gridSize.width-1 : targetPoint.x;
          targetPoint.y = (targetPoint.y < 0) ? 0 : (targetPoint.y > gridSize.height-1) ? gridSize.height-1 : targetPoint.y;
          moveHero(heroes[i], targetPoint);
        }
      }
    }
  }

  function moveHero(hero, targetPosition) {
    var path = getWalkablePath(hero.position, targetPosition);

    if (isChance(0.5)) {
      // behaviour to reduce path length
      var pathLength = Math.round(Math.random() * path.length-1)+1;
      var newPath = [];
      for (var i = 0; i < pathLength; i++) {
        newPath.push(path[i]);
      }
      path = newPath;
    }

    if (path.length > 0) {
      var tweens = [], nextPosX = 0, nextPosY = 0,
          lastPosX = hero.position.x * gridFieldSize.width,
          lastPosY = hero.position.y * gridFieldSize.height;

      for (var j = 0; j < path.length; j++) {
        nextPosX = path[j][0] * gridFieldSize.width;
        nextPosY = path[j][1] * gridFieldSize.height;
        var scope = this;

        tweens[j] = function(iJ, sourceX, sourceY, targetX, targetY, iFieldX, iFieldY, isLastField) {
          var distance = Math.sqrt(Math.pow(sourceX - targetX, 2) + Math.pow(sourceY - targetY, 2));
          return new TWEEN.Tween( { x: sourceX, y: sourceY } )
            .to(
              { x: targetX, y: targetY }, 1000 * distance / 10
            )
            .onUpdate( function () {
              hero.sprite.position.x = this.x;
              hero.sprite.position.y = this.y;
            })
            .onComplete( function () {
              hero.position.x = iFieldX;
              hero.position.y = iFieldY;
              if (isLastField) hero.movement = false;
            });
        }(
          j, lastPosX, lastPosY, nextPosX, nextPosY, path[j][0], path[j][1], (j == path.length - 1) ? true : false
        );

        lastPosX = nextPosX;
        lastPosY = nextPosY;

        if (j > 0) {
          tweens[j-1].chain(tweens[j]);
        }
      }

      tweens[0].start();
      hero.movement = true;
    }
  }

  function getWalkablePath(position, targetPosition) {
    var gridBackup = pathfindingGrid.clone();
    var finder = new PF.BestFirstFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });
    var path = finder.findPath(position.x, position.y, targetPosition.x, targetPosition.y, pathfindingGrid);
    path.splice(0, 1);
    pathfindingGrid = gridBackup;
    return path;
  }

});