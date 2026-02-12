// ================= AVL TREE IMPLEMENTATION =================

class Node {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  height(n) {
    return n ? n.height : 0;
  }

  balance(n) {
    return n ? this.height(n.left) - this.height(n.right) : 0;
  }

  rightRotate(y) {
    let x = y.left;
    let T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = 1 + Math.max(this.height(y.left), this.height(y.right));
    x.height = 1 + Math.max(this.height(x.left), this.height(x.right));

    return x;
  }

  leftRotate(x) {
    let y = x.right;
    let T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = 1 + Math.max(this.height(x.left), this.height(x.right));
    y.height = 1 + Math.max(this.height(y.left), this.height(y.right));

    return y;
  }

  insert(node, key) {
    if (!node) return new Node(key);

    // Allow duplicates → insert to right
    if (key < node.key)
      node.left = this.insert(node.left, key);
    else
      node.right = this.insert(node.right, key);

    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
    let bal = this.balance(node);

    // LL
    if (bal > 1 && key < node.left.key) {
      showRotation("LL Rotation (Right Rotate)");
      return this.rightRotate(node);
    }

    // RR
    if (bal < -1 && key >= node.right.key) {
      showRotation("RR Rotation (Left Rotate)");
      return this.leftRotate(node);
    }

    // LR
    if (bal > 1 && key >= node.left.key) {
      showRotation("LR Rotation (Left + Right)");
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }

    // RL
    if (bal < -1 && key < node.right.key) {
      showRotation("RL Rotation (Right + Left)");
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }

    return node;
  }

  insertKey(key) {
    this.root = this.insert(this.root, key);
  }

  minNode(n) {
    while (n.left) n = n.left;
    return n;
  }

  delete(node, key) {
    if (!node) return node;

    if (key < node.key)
      node.left = this.delete(node.left, key);
    else if (key > node.key)
      node.right = this.delete(node.right, key);
    else {
      if (!node.left || !node.right)
        node = node.left || node.right;
      else {
        let temp = this.minNode(node.right);
        node.key = temp.key;
        node.right = this.delete(node.right, temp.key);
      }
    }

    if (!node) return node;

    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
    let bal = this.balance(node);

    // LL
    if (bal > 1 && this.balance(node.left) >= 0) {
      showRotation("LL Rotation (Right Rotate)");
      return this.rightRotate(node);
    }

    // LR
    if (bal > 1 && this.balance(node.left) < 0) {
      showRotation("LR Rotation (Left + Right)");
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }

    // RR
    if (bal < -1 && this.balance(node.right) <= 0) {
      showRotation("RR Rotation (Left Rotate)");
      return this.leftRotate(node);
    }

    // RL
    if (bal < -1 && this.balance(node.right) > 0) {
      showRotation("RL Rotation (Right + Left)");
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }

    return node;
  }

  deleteKey(key) {
    this.root = this.delete(this.root, key);
  }
}

// ================= VISUALIZATION =================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const valInput = document.getElementById("val");

const NODE_RADIUS = 22;
const LEVEL_DISTANCE = 75;

let tree = new AVLTree();
let values = [];
let history = [];
let redoStack = [];
let rotationMessage = "";

// Show rotation message for 2 seconds
function showRotation(message) {
  rotationMessage = message;
  drawTree();

  setTimeout(() => {
    rotationMessage = "";
    drawTree();
  }, 2000);
}

function drawTree() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (tree.root)
    drawNode(tree.root, canvas.width / 2, 70, canvas.width / 4);

  // Show rotation text
  if (rotationMessage) {
    ctx.fillStyle = "red";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(rotationMessage, canvas.width / 2, 30);
  }
}

function drawNode(node, x, y, offset) {
  ctx.strokeStyle = getComputedStyle(document.body)
    .getPropertyValue('--line');

  if (node.left) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - offset, y + LEVEL_DISTANCE);
    ctx.stroke();
    drawNode(node.left, x - offset, y + LEVEL_DISTANCE, offset / 1.7);
  }

  if (node.right) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + offset, y + LEVEL_DISTANCE);
    ctx.stroke();
    drawNode(node.right, x + offset, y + LEVEL_DISTANCE, offset / 1.7);
  }

  drawCircle(x, y, node.key);
}

function drawCircle(x, y, text) {
  ctx.fillStyle = getComputedStyle(document.body)
    .getPropertyValue('--node');

  ctx.beginPath();
  ctx.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI);
  ctx.fill();

  ctx.strokeStyle = "#000";
  ctx.stroke();

  ctx.fillStyle = getComputedStyle(document.body)
    .getPropertyValue('--node-text');

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 14px Arial";
  ctx.fillText(text, x, y);
}

// ================= UI FUNCTIONS =================

function saveState() {
  history.push([...values]);
}

function rebuild() {
  tree = new AVLTree();
  values.forEach(v => tree.insertKey(v));
  drawTree();
}

function insertNode() {
  let val = Number(valInput.value);
  if (isNaN(val)) return;

  saveState();
  values.push(val);
  tree.insertKey(val);

  redoStack = [];
  valInput.value = "";
  drawTree();
}

function removeNode() {
  let val = Number(valInput.value);
  if (isNaN(val)) return;

  saveState();
  values = values.filter(v => v !== val);
  tree.deleteKey(val);

  redoStack = [];
  valInput.value = "";
  drawTree();
}

function undo() {
  if (history.length === 0) return;

  redoStack.push([...values]);
  values = history.pop();
  rebuild();
}

function redo() {
  if (redoStack.length === 0) return;

  history.push([...values]);
  values = redoStack.pop();
  rebuild();
}

function clearTree() {
  saveState();
  values = [];
  tree = new AVLTree();
  redoStack = [];
  drawTree();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  drawTree();
}

// Initial render
drawTree();
