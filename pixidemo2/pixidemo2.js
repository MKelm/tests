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

  var lastSpawnTryTime = 0, currentTime = 0;
  function animate() {
    renderer.render(stage);
    TWEEN.update();

    currentTime = new Date().getTime();
    if (currentTime - lastSpawnTryTime > 100) {
      lastSpawnTryTime = currentTime;
      spawnHero();
    }
    requestAnimFrame(function() { animate(); });
  }
  requestAnimFrame(function() { animate(); });

  // grid stuff
  var gridSize = { width: 100, height: 100 };
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
  var heroes = [], maxHeroes = 100;
  var spawnPoints = [
    { x: 0, y: 0 },
    { x: gridSize.width - 1, y: 0 },
    { x: gridSize.width - 1, y: gridSize.height - 1 },
    { x: 0, y: gridSize.height - 1 }
  ];
  var middlePoint = {x: Math.round(gridSize.width/2), y: Math.round(gridSize.height/2)};

  function spawnHero() {
    if (isChance(0.3 - (0.3 / maxHeroes * heroes.length))) {
      console.log("spawn hero with chance", 0.3 - (0.3 / maxHeroes * heroes.length));
      var position = spawnPoints[Math.round(Math.random() * (spawnPoints.length-1))];
      heroes.push(position);
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