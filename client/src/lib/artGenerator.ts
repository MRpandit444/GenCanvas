import p5 from "p5";
import { ArtParams } from "@/types/art";

export class ArtGenerator {
  p5Instance: p5 | null = null;
  canvasWidth: number = 0;
  canvasHeight: number = 0;
  containerElement: HTMLElement | null = null;
  params: ArtParams | null = null;
  artReady: boolean = false;

  initialize(container: HTMLElement, params: ArtParams) {
    this.containerElement = container;
    this.params = params;
    
    const sketch = (p: p5) => {
      p.setup = () => {
        this.canvasWidth = container.offsetWidth;
        this.canvasHeight = Math.max(400, Math.min(600, this.canvasWidth * 0.67));
        
        p.createCanvas(this.canvasWidth, this.canvasHeight);
        p.background(15, 23, 42); // Canvas background color
        
        // Draw initial artwork
        this.drawArtwork(p);
        
        // Handle window resize
        p.windowResized = () => {
          if (this.containerElement) {
            this.canvasWidth = this.containerElement.offsetWidth;
            this.canvasHeight = Math.max(400, Math.min(600, this.canvasWidth * 0.67));
            p.resizeCanvas(this.canvasWidth, this.canvasHeight);
            this.drawArtwork(p);
          }
        };
      };
      
      p.draw = () => {
        // p.draw is intentionally empty as we call drawArtwork manually
      };
    };
    
    this.p5Instance = new p5(sketch, container);
  }

  updateParams(params: ArtParams) {
    this.params = params;
    if (this.p5Instance) {
      this.drawArtwork(this.p5Instance);
    }
  }

  drawArtwork(p: p5) {
    if (!this.params) return;
    
    p.clear();
    p.background(15, 23, 42); // canvas.DEFAULT color
    
    const colors = this.params.colorPalettes[this.params.palette].colors;
    const count = parseInt(this.params.complexity.toString());
    const size = parseInt(this.params.elementSize.toString());
    const randomFactor = parseInt(this.params.randomness.toString()) / 100;
    
    p.noStroke();
    
    switch (this.params.pattern) {
      case 'scatter':
        this.drawScatterPattern(p, colors, count, size, randomFactor);
        break;
      case 'grid':
        this.drawGridPattern(p, colors, count, size, randomFactor);
        break;
      case 'spiral':
        this.drawSpiralPattern(p, colors, count, size, randomFactor);
        break;
      case 'wave':
        this.drawWavePattern(p, colors, count, size, randomFactor);
        break;
    }
    
    this.artReady = true;
  }

  // Pattern drawing methods
  drawScatterPattern(p: p5, colors: string[], count: number, size: number, randomFactor: number) {
    for (let i = 0; i < count; i++) {
      const x = p.random(this.canvasWidth);
      const y = p.random(this.canvasHeight);
      const s = p.random(size * 0.5, size * 1.5);
      const colorIndex = Math.floor(p.random(colors.length));
      
      p.fill(colors[colorIndex]);
      this.drawShape(p, x, y, s, this.params!.shape, randomFactor);
    }
  }
  
  drawGridPattern(p: p5, colors: string[], count: number, size: number, randomFactor: number) {
    const cols = Math.sqrt(count);
    const rows = cols;
    const cellW = this.canvasWidth / cols;
    const cellH = this.canvasHeight / rows;
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * cellW + cellW / 2;
        const y = j * cellH + cellH / 2;
        const s = size * (1 - randomFactor * 0.5 + p.random(randomFactor));
        const colorIndex = Math.floor((i + j) % colors.length);
        
        p.fill(colors[colorIndex]);
        
        // Add some randomness to position if randomFactor > 0
        const offsetX = randomFactor * p.random(-cellW / 3, cellW / 3);
        const offsetY = randomFactor * p.random(-cellH / 3, cellH / 3);
        
        this.drawShape(p, x + offsetX, y + offsetY, s, this.params!.shape, randomFactor);
      }
    }
  }
  
  drawSpiralPattern(p: p5, colors: string[], count: number, size: number, randomFactor: number) {
    const maxRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.45;
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    
    for (let i = 0; i < count; i++) {
      const angle = 0.1 * i;
      const radius = (maxRadius * i) / count;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const s = size * (1 - 0.5 * (i / count)) * (1 - randomFactor * 0.3 + p.random(randomFactor * 0.6));
      const colorIndex = i % colors.length;
      
      p.fill(colors[colorIndex]);
      this.drawShape(p, x, y, s, this.params!.shape, randomFactor);
    }
  }
  
  drawWavePattern(p: p5, colors: string[], count: number, size: number, randomFactor: number) {
    const amplitude = this.canvasHeight * 0.2;
    const frequency = 0.02;
    
    for (let i = 0; i < count; i++) {
      const x = (this.canvasWidth * i) / count;
      const baseY = this.canvasHeight / 2;
      const wave1 = amplitude * Math.sin(frequency * x);
      const wave2 = amplitude * 0.5 * Math.sin(frequency * 2 * x + 1);
      const y = baseY + wave1 + wave2;
      
      const s = size * (1 - randomFactor * 0.3 + p.random(randomFactor * 0.6));
      const colorIndex = Math.floor((x / this.canvasWidth) * colors.length) % colors.length;
      
      p.fill(colors[colorIndex]);
      this.drawShape(p, x, y, s, this.params!.shape, randomFactor);
    }
  }
  
  // Draw a specific shape
  drawShape(p: p5, x: number, y: number, size: number, shape: string, randomFactor: number) {
    const rotation = p.random(p.TWO_PI);
    p.push();
    p.translate(x, y);
    p.rotate(rotation);
    
    switch (shape) {
      case 'circle':
        p.ellipse(0, 0, size, size);
        break;
      case 'triangle':
        p.triangle(0, -size/2, size/2, size/2, -size/2, size/2);
        break;
      case 'rectangle':
        if (randomFactor > 0.5) {
          // Potentially draw a rectangle with different width/height ratio
          const w = size * p.random(0.8, 1.2);
          const h = size * p.random(0.8, 1.2);
          p.rect(-w/2, -h/2, w, h);
        } else {
          p.rect(-size/2, -size/2, size, size);
        }
        break;
      case 'line':
        p.strokeWeight(size / 6);
        p.stroke(p.color(p.drawingContext.fillStyle as string));
        p.line(-size/2, 0, size/2, 0);
        p.noStroke();
        break;
    }
    
    p.pop();
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.p5Instance?.canvas || null;
  }

  destroy() {
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
  }
}
