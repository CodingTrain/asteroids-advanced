var input = {
  listeners: {
    key: {},
    mouse: {}
  },

  registerMouseListener: function(id, index, callback) {
    if (this.listeners.mouse[index] == undefined) {
      this.listeners.mouse[index] = {};
    }
    if (this.listeners.mouse[index][id] == undefined) {
      this.listeners.mouse[index][id] = [];
    }

    this.listeners.mouse[index][id].push(callback);
  },

  deregisterMouseListener: function(id, index) {
    delete this.listeners.mouse[index][id];
  },

  handleMouseEvent: function(button, press) {
    if (this.listeners.mouse[button] != undefined) {
      for (var i in this.listeners.mouse[button]) {
        for (var j = 0; j < this.listeners.mouse[button][i].length; j++) {
          this.listeners.mouse[button][i][j](button, press);
        }
      }
    }
  },

  registerKeyListener: function(id, index, callback) {
    if (this.listeners.key[index] == undefined) {
      this.listeners.key[index] = {};
    }
    if (this.listeners.key[index][id] == undefined) {
      this.listeners.key[index][id] = [];
    }

    this.listeners.key[index][id].push(callback);
  },

  deregisterKeyListener: function(id, index) {
    delete this.listeners.key[index][id];
  },

  handleKeyEvent: function(char, code, press) {
    if (this.listeners.key[code] != undefined) {
      for (var i in this.listeners.key[code]) {
        for (var j = 0; j < this.listeners.key[code][i].length; j++) {
          this.listeners.key[code][i][j](char, code, press);
        }
      }
    }
  }
};

function keyReleased() {
  input.handleKeyEvent(key, keyCode, false);
}

function keyPressed() {
  input.handleKeyEvent(key, keyCode, true);
}

function mousePressed() {
  input.handleMouseEvent(mouseButton, true);
}

function mouseReleased() {
  input.handleMouseEvent(mouseButton, false);
}
