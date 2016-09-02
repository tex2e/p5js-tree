'use strict';

window.Settings = {
  branchColor: '#000000', // black
  nest: 9,
  startBranchLength: 130,
  rightBranchMagnificationRate:  [0.3, 0.7], // [min, max]
  centerBranchMagnificationRate: [0.5, 0.9], // [min, max]
  leftBranchMagnificationRate:   [0.3, 0.7], // [min, max]
  rightRotation: Math.PI / 4,
  leftRotation:  Math.PI / 4,
  rotationCenter:    [-0.3, 0.3], // [min, max]
  rightRotationRate: [0.6, 0.9],  // [min, max]
  leftRotationRate:  [0.6, 0.9],  // [min, max]
}

function setup() {
  createCanvas(640, 640);
  drawTree();
}

function mouseClicked() {
  if (0 <= mouseX && mouseX < width &&
      0 <= mouseY && mouseY < height) {
    drawTree();
  }
}

function drawTree() {
  clear();
  background('rgba(255,255,255,0)');
  translate(width / 2, height - 10);
  rotate(PI);

  stroke(Settings.branchColor);
  branch(0, 0, Settings.startBranchLength, Settings.nest);
}

function branch(beginX, beginY, length, nest) {
  // --- decrement nest ---
  if (nest === undefined) nest = 10;
  if (nest === 0) return;

  if (length <= 0.01) return;

  // --- draw line ---
  var endX = beginX;
  var endY = beginY + length;
  line(beginX, beginY, endX, endY);
  if (nest === 1) return;

  // --- new branch (recursion) ---
  var rotateRight  =  Settings.rightRotation * random.apply(null, Settings.rightRotationRate);
  var rotateCenter =  random.apply(null, Settings.rotationCenter);
  var rotateLeft   = -Settings.leftRotation  * random.apply(null, Settings.leftRotationRate);

  translate(endX, endY);

  rotate(rotateRight);
  branch(0, 0, length * random.apply(null, Settings.rightBranchMagnificationRate), nest - 1);
  rotate(-rotateRight);

  rotate(rotateCenter);
  branch(0, 0, length * random.apply(null, Settings.centerBranchMagnificationRate), nest - 1);
  rotate(-rotateCenter);

  rotate(rotateLeft);
  branch(0, 0, length * random.apply(null, Settings.leftBranchMagnificationRate), nest - 1);
  rotate(-rotateLeft);

  translate(-endX, -endY);
}


// === Drawing Settings ===

// --- color picker ---

$('#js_branch_color').colorpicker({
  color: Settings.branchColor
}).on('hidePicker', function () {
  Settings.branchColor = $(this).data('colorpicker').color.toHex();
});

// --- slider ---

$('#js_nest').slider({
  min: 0,
  max: 10,
  step: 1,
  value: Settings.nest,
}).on('slideStop', function () {
  Settings.nest = $(this).data('slider').getValue();
});

$('#js_start_branch_length').slider({
  min: 0,
  max: 200,
  step: 5,
  value: Settings.startBranchLength,
  formatter: function (value) {
    return value + " px"
  },
}).on('slideStop', function () {
  Settings.startBranchLength = $(this).data('slider').getValue();
});

$('#js_right_branch_magnification_rate').slider({
  min: 0,
  max: 1,
  step: 0.1,
  value: Settings.rightBranchMagnificationRate,
  formatter: function (value) {
    return "× " + value[0] + " ~ " + value[1]
  },
}).on('slideStop', function () {
  Settings.rightBranchMagnificationRate = $(this).data('slider').getValue();
});

$('#js_center_branch_magnification_rate').slider({
  min: 0,
  max: 1,
  step: 0.1,
  value: Settings.centerBranchMagnificationRate,
  formatter: function (value) {
    return "× " + value[0] + " ~ " + value[1]
  },
}).on('slideStop', function () {
  Settings.centerBranchMagnificationRate = $(this).data('slider').getValue();
});

$('#js_left_branch_magnification_rate').slider({
  min: 0,
  max: 1,
  step: 0.1,
  value: Settings.leftBranchMagnificationRate,
  formatter: function (value) {
    return "× " + value[0] + " ~ " + value[1]
  },
}).on('slideStop', function () {
  Settings.leftBranchMagnificationRate = $(this).data('slider').getValue();
});

$('#js_right_rotation').slider({
  min: 0,
  max: Math.PI / 2,
  step: 0.01,
  value: Settings.rightRotation,
  formatter: function (value) {
    return value + " rad"
  },
}).on('slideStop', function () {
  Settings.rightRotation = $(this).data('slider').getValue();
});

$('#js_center_rotation').slider({
  min: -1,
  max: 1,
  step: 0.1,
  value: Settings.rotationCenter,
  formatter: function (value) {
    return value[0] + " ~ " + value[1] + " rad"
  },
}).on('slideStop', function () {
  Settings.rotationCenter = $(this).data('slider').getValue();
});

$('#js_left_rotation').slider({
  min: 0,
  max: Math.PI / 2,
  step: 0.01,
  value: Settings.leftRotation,
  formatter: function (value) {
    return value + " rad"
  },
}).on('slideStop', function () {
  Settings.leftRotation = $(this).data('slider').getValue();
});

$('#js_right_rotation_rate').slider({
  min: 0,
  max: 1,
  step: 0.1,
  value: Settings.rightRotationRate,
  formatter: function (value) {
    return "× " + value[0] + " ~ " + value[1]
  },
}).on('slideStop', function () {
  Settings.rightRotationRate = $(this).data('slider').getValue();
});

$('#js_left_rotation_rate').slider({
  min: 0,
  max: 1,
  step: 0.1,
  value: Settings.leftRotationRate,
  formatter: function (value) {
    return "× " + value[0] + " ~ " + value[1]
  },
}).on('slideStop', function () {
  Settings.leftRotationRate = $(this).data('slider').getValue();
});
