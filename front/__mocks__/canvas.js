class CanvasRenderingContext2D {
  constructor(width, height) {
    this.canvas = { width, height };
    this.font = '10px sans-serif';
    this.textAlign = 'left';
    this.textBaseline = 'alphabetic';
  }
  measureText(text) { return { width: (text || '').length * 7 }; }
  getImageData() { return { data: new Uint8ClampedArray(this.canvas.width * this.canvas.height * 4) }; }
  createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4) }; }
  putImageData() { }
  fillRect() { }
  clearRect() { }
  drawImage() { }
  beginPath() { }
  closePath() { }
  moveTo() { }
  lineTo() { }
  stroke() { }
  fill() { }
  rect() { }
  fillText() { }
  strokeText() { }
  save() { }
  restore() { }
  rotate() { }
  scale() { }
  translate() { }
  createLinearGradient() { return { addColorStop() { } }; }
  createRadialGradient() { return { addColorStop() { } }; }
}

class Canvas {
  constructor(width = 300, height = 150) {
    this.width = width;
    this.height = height;
  }
  getContext(type) {
    return type === '2d' ? new CanvasRenderingContext2D(this.width, this.height) : null;
  }
  toBuffer() { return Buffer.alloc(0); }
  toDataURL() { return 'data:image/png;base64,'; }
}

class Image {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.onload = null;
    this.onerror = null;
    this.src = '';
  }
}

module.exports = {
  Canvas,
  Image,
  CanvasRenderingContext2D,
  createCanvas: (width = 300, height = 150) => new Canvas(width, height),
  loadImage: async (_src) => new Image(),
  registerFont: (_path, _options) => { },
};
