'use strict';

window.Settings = {
  seed: 2048,
  depth: 9,
  density: 76,
  spread: 34,
  roughness: 42,
  thickness: 5,
  branchLength: 70,
  occupancy: 82,
  backgroundColor: '#f2f0e8',
  branchColor: '#33453b',
  tipColor: '#8e9f76'
};

var Settings = window.Settings;
var canvasReady = false;
var redrawTimer = null;
var canvasWidth = 0;
var canvasHeight = 0;

var colorPresets = {
  botanical: { backgroundColor: '#f2f0e8', branchColor: '#33453b', tipColor: '#8e9f76' },
  spring: { backgroundColor: '#fff7f2', branchColor: '#665550', tipColor: '#d99ba2' },
  night: { backgroundColor: '#12262a', branchColor: '#597771', tipColor: '#bad6bc' }
};

function setup() {
  var holder = document.getElementById('canvas-holder');
  var size = Math.max(1, Math.floor(holder.clientWidth));
  canvasWidth = size;
  canvasHeight = size;
  var canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-holder');
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  noLoop();
  strokeCap(ROUND);
  canvasReady = true;
  renderTree();
}

function renderTree() {
  if (!canvasReady) return;

  background(Settings.backgroundColor);

  var nodes = [];
  var bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  buildBranch(0, 0, 100, Settings.depth, -Math.PI / 2, 'root', nodes, bounds);

  if (nodes.length === 0) {
    updateCaption(0);
    return;
  }

  var treeWidth = Math.max(1, bounds.maxX - bounds.minX);
  var treeHeight = Math.max(1, bounds.maxY - bounds.minY);
  var availableWidth = Math.max(1, width - 44);
  var availableHeight = Math.max(1, height - 44);
  var fitScale = Math.min(availableWidth / treeWidth, availableHeight / treeHeight);
  var viewScale = fitScale * (Settings.occupancy / 100);
  var offsetX = (width - treeWidth * viewScale) / 2 - bounds.minX * viewScale;
  var offsetY = (height - treeHeight * viewScale) / 2 - bounds.minY * viewScale;
  var baseColor = color(Settings.branchColor);
  var tipColor = color(Settings.tipColor);
  var deepestLevel = Math.max(1, Settings.depth - 1);

  push();
  translate(offsetX, offsetY);
  scale(viewScale);
  for (var i = 0; i < nodes.length; i += 1) {
    var node = nodes[i];
    var progress = node.level / deepestLevel;
    stroke(lerpColor(baseColor, tipColor, progress));
    strokeWeight(Math.max(0.35, Settings.thickness * Math.pow(0.72, node.level)));
    line(node.x1, node.y1, node.x2, node.y2);
  }
  pop();

  updateCaption(nodes.length);
}

function buildBranch(x, y, length, depth, heading, path, nodes, bounds) {
  if (depth <= 0 || length < 0.7 || nodes.length >= 90000) return;

  var roughness = Settings.roughness / 100;
  var actualLength = length * (1 + (randomFor(path, 'length') - 0.5) * roughness * 0.3);
  var endX = x + Math.cos(heading) * actualLength;
  var endY = y + Math.sin(heading) * actualLength;
  var level = Settings.depth - depth;

  nodes.push({ x1: x, y1: y, x2: endX, y2: endY, level: level });
  bounds.minX = Math.min(bounds.minX, x, endX);
  bounds.minY = Math.min(bounds.minY, y, endY);
  bounds.maxX = Math.max(bounds.maxX, x, endX);
  bounds.maxY = Math.max(bounds.maxY, y, endY);

  if (depth <= 1) return;

  var spread = Settings.spread * Math.PI / 180;
  var rightAngle = spread
    + (randomFor(path, 'right-angle') - 0.5) * spread * roughness * 0.65;
  var leftAngle = spread
    + (randomFor(path, 'left-angle') - 0.5) * spread * roughness * 0.65;
  var centerAngle = (randomFor(path, 'center-angle') - 0.5) * spread * roughness * 0.6;

  if (randomFor(path, 'right-branch') <= Settings.density / 100) {
    buildChild(endX, endY, length, depth, heading + rightAngle, path + 'R', nodes, bounds);
  }
  buildChild(endX, endY, length, depth, heading + centerAngle, path + 'C', nodes, bounds);
  if (randomFor(path, 'left-branch') <= Settings.density / 100) {
    buildChild(endX, endY, length, depth, heading - leftAngle, path + 'L', nodes, bounds);
  }
}

function buildChild(x, y, parentLength, depth, heading, path, nodes, bounds) {
  var roughness = Settings.roughness / 100;
  var ratioVariation = 1 + (randomFor(path, 'ratio') - 0.5) * roughness * 0.3;
  var childLength = parentLength * (Settings.branchLength / 100) * ratioVariation;
  buildBranch(x, y, childLength, depth - 1, heading, path, nodes, bounds);
}

function randomFor(path, channel) {
  var input = String(Settings.seed) + ':' + path + ':' + channel;
  var hash = 2166136261;
  for (var i = 0; i < input.length; i += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(i), 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function updateCaption(count) {
  document.getElementById('seed-caption').textContent = Settings.seed;
  document.getElementById('branch-count').textContent = count.toLocaleString('ja-JP');
}

function scheduleRender() {
  if (!canvasReady) return;
  window.clearTimeout(redrawTimer);
  redrawTimer = window.setTimeout(renderTree, 70);
}

function updateRangeOutput(input) {
  var output = document.querySelector('output[for="' + input.id + '"]');
  if (!output) return;
  var value = input.value;
  if (input.id === 'depth') value += ' 段';
  if (input.id === 'density' || input.id === 'roughness' || input.id === 'branch-length' || input.id === 'occupancy') value += '%';
  if (input.id === 'spread') value += '°';
  if (input.id === 'thickness') value += ' px';
  output.textContent = value;
}

function setPreset(name) {
  var preset = colorPresets[name];
  if (!preset) return;
  Settings.backgroundColor = preset.backgroundColor;
  Settings.branchColor = preset.branchColor;
  Settings.tipColor = preset.tipColor;
  document.getElementById('background-color').value = preset.backgroundColor;
  document.getElementById('branch-color').value = preset.branchColor;
  document.getElementById('tip-color').value = preset.tipColor;
  document.querySelectorAll('.style-button').forEach(function (button) {
    var active = button.dataset.preset === name;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  scheduleRender();
}

function setSeed(value) {
  var numericSeed = Number(value);
  if (!Number.isFinite(numericSeed)) return;
  Settings.seed = Math.max(1, Math.min(999999, Math.floor(numericSeed)));
  document.getElementById('seed-input').value = Settings.seed;
  scheduleRender();
}

document.querySelectorAll('input[type="range"]').forEach(function (input) {
  updateRangeOutput(input);
  input.addEventListener('input', function () {
    Settings[input.id.replace(/-([a-z])/g, function (_, letter) { return letter.toUpperCase(); })] = Number(input.value);
    updateRangeOutput(input);
    scheduleRender();
  });
});

document.querySelectorAll('.style-button').forEach(function (button) {
  button.addEventListener('click', function () { setPreset(button.dataset.preset); });
});

[
  ['background-color', 'backgroundColor'],
  ['branch-color', 'branchColor'],
  ['tip-color', 'tipColor']
].forEach(function (entry) {
  document.getElementById(entry[0]).addEventListener('input', function (event) {
    Settings[entry[1]] = event.target.value;
    document.querySelectorAll('.style-button').forEach(function (button) {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
    });
    scheduleRender();
  });
});

document.getElementById('seed-input').addEventListener('input', function (event) {
  if (event.target.value !== '') setSeed(event.target.value);
});
document.getElementById('seed-input').addEventListener('change', function (event) {
  setSeed(event.target.value || Settings.seed);
});

document.getElementById('new-tree').addEventListener('click', function () {
  var nextSeed = Settings.seed;
  while (nextSeed === Settings.seed) nextSeed = Math.floor(Math.random() * 999999) + 1;
  setSeed(nextSeed);
});

document.getElementById('save-image').addEventListener('click', function () {
  window.clearTimeout(redrawTimer);
  renderTree();
  var canvas = document.querySelector('#canvas-holder canvas');
  var download = document.createElement('a');
  download.download = 'tree-' + Settings.seed + '.png';
  download.href = canvas.toDataURL('image/png');
  download.click();
});

window.addEventListener('resize', function () {
  if (!canvasReady) return;
  var holder = document.getElementById('canvas-holder');
  var nextSize = Math.max(1, Math.floor(holder.clientWidth));
  if (nextSize === canvasWidth && nextSize === canvasHeight) return;
  canvasWidth = nextSize;
  canvasHeight = nextSize;
  resizeCanvas(canvasWidth, canvasHeight, true);
  renderTree();
});
