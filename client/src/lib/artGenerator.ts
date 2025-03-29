import p5 from "p5";
import { ArtParams, LayerSettings } from "@/types/art";

export class ArtGenerator {
  p5Instance: p5 | null = null;
  canvasWidth: number = 0;
  canvasHeight: number = 0;
  containerElement: HTMLElement | null = null;
  params: ArtParams | null = null;
  artReady: boolean = false;
  frameCount: number = 0;
  animationActive: boolean = false;
  buffers: Map<string, p5.Graphics> = new Map();
  
  initialize(container: HTMLElement, params: ArtParams) {
    this.containerElement = container;
    this.params = this.initializeDefaultParams(params);
    
    // Set default dimensions if container has no dimensions yet
    this.canvasWidth = container.offsetWidth || 600;
    this.canvasHeight = Math.max(400, Math.min(600, this.canvasWidth * 0.67));
    
    const sketch = (p: p5) => {
      p.setup = () => {
        // Ensure we have real dimensions
        if (container.offsetWidth > 0) {
          this.canvasWidth = container.offsetWidth;
          this.canvasHeight = Math.max(400, Math.min(600, this.canvasWidth * 0.67));
        } else {
          console.log("Container has zero width, using default dimensions");
          // Force dimensions if container is not ready
          container.style.width = this.canvasWidth + "px";
          container.style.height = this.canvasHeight + "px";
        }
        
        p.createCanvas(this.canvasWidth, this.canvasHeight);
        p.background(15, 23, 42); // Canvas background color
        
        // Initialize layer buffers
        this.createLayerBuffers(p);
        
        // Draw initial artwork
        this.drawArtwork(p);
        
        // Handle window resize
        p.windowResized = () => {
          if (this.containerElement && this.containerElement.offsetWidth > 0) {
            this.canvasWidth = this.containerElement.offsetWidth;
            this.canvasHeight = Math.max(400, Math.min(600, this.canvasWidth * 0.67));
            p.resizeCanvas(this.canvasWidth, this.canvasHeight);
            
            // Recreate layer buffers with new size
            this.createLayerBuffers(p);
            this.drawArtwork(p);
          }
        };
      };
      
      p.draw = () => {
        // Only redraw if animation is active
        if (this.params?.animated && this.animationActive) {
          this.frameCount += 1;
          this.drawAnimatedArtwork(p);
        }
      };
    };
    
    this.p5Instance = new p5(sketch, container);
  }

  initializeDefaultParams(params: ArtParams): ArtParams {
    // Ensure new parameters are initialized with defaults if not present
    return {
      ...params,
      animated: params.animated || false,
      animationSpeed: params.animationSpeed || 5,
      useGradientBackground: params.useGradientBackground || false,
      backgroundColor: params.backgroundColor || '#0f172a',
      backgroundEndColor: params.backgroundEndColor || '#334155',
      filterEffect: params.filterEffect || 'none',
      filterIntensity: params.filterIntensity || 50,
      layers: params.layers || [this.createDefaultLayer()],
      activeLayer: params.activeLayer || 0
    };
  }

  createDefaultLayer(): LayerSettings {
    return {
      id: `layer_${Date.now()}`,
      visible: true,
      opacity: 100,
      blendMode: 'source-over',
      shape: 'circle',
      pattern: 'scatter',
      palette: 0,
      complexity: 50,
      elementSize: 20,
      randomness: 50
    };
  }

  createLayerBuffers(p: p5) {
    // Clear existing buffers
    this.buffers.clear();
    
    if (this.params?.layers) {
      // Create a buffer for each layer
      this.params.layers.forEach(layer => {
        const buffer = p.createGraphics(this.canvasWidth, this.canvasHeight);
        this.buffers.set(layer.id, buffer);
      });
    }
  }

  updateParams(params: ArtParams) {
    // Check if new layers were added
    const needNewBuffers = params.layers?.some(
      layer => !this.params?.layers.find(l => l.id === layer.id)
    );
    
    this.params = this.initializeDefaultParams(params);
    
    if (this.p5Instance) {
      // Create new buffers if needed
      if (needNewBuffers) {
        this.createLayerBuffers(this.p5Instance);
      }
      this.drawArtwork(this.p5Instance);
    }
    
    // Start or stop animation based on params
    this.animationActive = this.params.animated;
  }

  drawArtwork(p: p5) {
    if (!this.params) return;
    
    p.clear();
    
    // Draw background
    this.drawBackground(p);
    
    // Draw each layer to its buffer
    if (this.params.layers) {
      this.params.layers.forEach(layer => {
        if (layer.visible) {
          const buffer = this.buffers.get(layer.id);
          if (buffer) {
            buffer.clear();
            this.drawLayerToBuffer(buffer, layer);
          }
        }
      });
    
      // Composite layers onto canvas
      this.compositeLayers(p);
    } else {
      // Fallback to drawing directly on canvas if no layers
      this.drawMainPattern(p);
    }
    
    // Apply filter effects
    this.applyFilters(p);
    
    this.artReady = true;
  }

  drawAnimatedArtwork(p: p5) {
    if (!this.params || !this.params.animated) return;
    
    p.clear();
    
    // Draw background
    this.drawBackground(p);
    
    // Increment frameCount for animation
    const animOffset = this.frameCount * (this.params.animationSpeed / 100);
    
    // Draw each layer to its buffer with animation
    if (this.params.layers) {
      this.params.layers.forEach(layer => {
        if (layer.visible) {
          const buffer = this.buffers.get(layer.id);
          if (buffer) {
            buffer.clear();
            this.drawLayerToBuffer(buffer, layer, animOffset);
          }
        }
      });
    
      // Composite layers onto canvas
      this.compositeLayers(p);
    } else {
      // Fallback to drawing directly on canvas if no layers
      this.drawMainPattern(p, animOffset);
    }
    
    // Apply filter effects
    this.applyFilters(p);
  }

  drawBackground(p: p5) {
    if (!this.params) return;
    
    if (this.params.useGradientBackground) {
      // Draw gradient background
      const c1 = p.color(this.params.backgroundColor);
      const c2 = p.color(this.params.backgroundEndColor);
      
      for (let y = 0; y < this.canvasHeight; y++) {
        const inter = p.map(y, 0, this.canvasHeight, 0, 1);
        const c = p.lerpColor(c1, c2, inter);
        p.stroke(c);
        p.line(0, y, this.canvasWidth, y);
      }
    } else {
      // Draw solid background
      p.background(this.params.backgroundColor);
    }
  }

  compositeLayers(p: p5) {
    if (!this.params?.layers) return;
    
    // Draw layers in order, respecting blend modes and opacity
    this.params.layers.forEach(layer => {
      if (layer.visible) {
        const buffer = this.buffers.get(layer.id);
        if (buffer) {
          // Set blend mode
          p.blendMode(this.getP5BlendMode(p, layer.blendMode));
          
          // Draw with opacity
          const opacity = layer.opacity / 100;
          if (opacity < 1) {
            p.tint(255, opacity * 255);
            p.image(buffer, 0, 0);
            p.noTint();
          } else {
            p.image(buffer, 0, 0);
          }
          
          // Reset blend mode
          p.blendMode(p.BLEND);
        }
      }
    });
  }

  getP5BlendMode(p: p5, blendMode: string): p5.BLEND_MODE {
    switch (blendMode) {
      case 'multiply': return p.MULTIPLY;
      case 'screen': return p.SCREEN;
      case 'overlay': return p.OVERLAY;
      case 'hard-light': return p.HARD_LIGHT;
      case 'soft-light': return p.SOFT_LIGHT;
      case 'dodge': return p.DODGE;
      case 'burn': return p.BURN;
      default: return p.BLEND;
    }
  }

  drawLayerToBuffer(buffer: p5.Graphics, layer: LayerSettings, animOffset: number = 0) {
    if (!this.params) return;
    
    // Get palette for this layer
    const palette = this.params.colorPalettes[layer.palette] || this.params.colorPalettes[0];
    const colors = palette.colors;
    
    // Use layer-specific settings
    const count = layer.complexity;
    const size = layer.elementSize;
    const randomFactor = layer.randomness / 100;
    
    buffer.noStroke();
    
    switch (layer.pattern) {
      case 'scatter':
        this.drawScatterPattern(buffer, colors, count, size, randomFactor, layer.shape, animOffset);
        break;
      case 'grid':
        this.drawGridPattern(buffer, colors, count, size, randomFactor, layer.shape, animOffset);
        break;
      case 'spiral':
        this.drawSpiralPattern(buffer, colors, count, size, randomFactor, layer.shape, animOffset);
        break;
      case 'wave':
        this.drawWavePattern(buffer, colors, count, size, randomFactor, layer.shape, animOffset);
        break;
      case 'concentric':
        this.drawConcentricPattern(buffer, colors, count, size, randomFactor, layer.shape, animOffset);
        break;
      case 'radial':
        this.drawRadialPattern(buffer, colors, count, size, randomFactor, layer.shape, animOffset);
        break;
    }
  }

  drawMainPattern(p: p5, animOffset: number = 0) {
    if (!this.params) return;
    
    const colors = this.params.colorPalettes[this.params.palette].colors;
    const count = parseInt(this.params.complexity.toString());
    const size = parseInt(this.params.elementSize.toString());
    const randomFactor = parseInt(this.params.randomness.toString()) / 100;
    
    p.noStroke();
    
    switch (this.params.pattern) {
      case 'scatter':
        this.drawScatterPattern(p, colors, count, size, randomFactor, this.params.shape, animOffset);
        break;
      case 'grid':
        this.drawGridPattern(p, colors, count, size, randomFactor, this.params.shape, animOffset);
        break;
      case 'spiral':
        this.drawSpiralPattern(p, colors, count, size, randomFactor, this.params.shape, animOffset);
        break;
      case 'wave':
        this.drawWavePattern(p, colors, count, size, randomFactor, this.params.shape, animOffset);
        break;
      case 'concentric':
        this.drawConcentricPattern(p, colors, count, size, randomFactor, this.params.shape, animOffset);
        break;
      case 'radial':
        this.drawRadialPattern(p, colors, count, size, randomFactor, this.params.shape, animOffset);
        break;
    }
  }

  // Pattern drawing methods
  drawScatterPattern(p: p5 | p5.Graphics, colors: string[], count: number, size: number, randomFactor: number, shape: string, animOffset: number = 0) {
    for (let i = 0; i < count; i++) {
      const x = p.random(this.canvasWidth);
      const y = p.random(this.canvasHeight);
      const s = p.random(size * 0.5, size * 1.5);
      const colorIndex = Math.floor(p.random(colors.length));
      
      // Add animation offset to position
      const animX = animOffset ? (x + Math.sin(i + animOffset) * 5) : x; 
      const animY = animOffset ? (y + Math.cos(i + animOffset) * 5) : y;
      
      p.fill(colors[colorIndex]);
      this.drawShape(p, animX, animY, s, shape, randomFactor, animOffset);
    }
  }
  
  drawGridPattern(p: p5 | p5.Graphics, colors: string[], count: number, size: number, randomFactor: number, shape: string, animOffset: number = 0) {
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
        
        // Add some randomness to position
        let offsetX = randomFactor * p.random(-cellW / 3, cellW / 3);
        let offsetY = randomFactor * p.random(-cellH / 3, cellH / 3);
        
        // Add animation offset
        if (animOffset) {
          offsetX += Math.sin(i + j + animOffset) * 5;
          offsetY += Math.cos(i - j + animOffset) * 5;
        }
        
        p.fill(colors[colorIndex]);
        this.drawShape(p, x + offsetX, y + offsetY, s, shape, randomFactor, animOffset);
      }
    }
  }
  
  drawSpiralPattern(p: p5 | p5.Graphics, colors: string[], count: number, size: number, randomFactor: number, shape: string, animOffset: number = 0) {
    const maxRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.45;
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    
    for (let i = 0; i < count; i++) {
      // Add animation to angle for rotation effect
      const angle = 0.1 * i + (animOffset ? animOffset * 0.05 : 0);
      const radius = (maxRadius * i) / count;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const s = size * (1 - 0.5 * (i / count)) * (1 - randomFactor * 0.3 + p.random(randomFactor * 0.6));
      const colorIndex = i % colors.length;
      
      p.fill(colors[colorIndex]);
      this.drawShape(p, x, y, s, shape, randomFactor, animOffset);
    }
  }
  
  drawWavePattern(p: p5 | p5.Graphics, colors: string[], count: number, size: number, randomFactor: number, shape: string, animOffset: number = 0) {
    const amplitude = this.canvasHeight * 0.2;
    const frequency = 0.02;
    
    for (let i = 0; i < count; i++) {
      const x = (this.canvasWidth * i) / count;
      const baseY = this.canvasHeight / 2;
      
      // Add animation offset to waves
      const phase = animOffset ? animOffset * 0.1 : 0;
      const wave1 = amplitude * Math.sin(frequency * x + phase);
      const wave2 = amplitude * 0.5 * Math.sin(frequency * 2 * x + 1 + phase * 2);
      const y = baseY + wave1 + wave2;
      
      const s = size * (1 - randomFactor * 0.3 + p.random(randomFactor * 0.6));
      const colorIndex = Math.floor((x / this.canvasWidth) * colors.length) % colors.length;
      
      p.fill(colors[colorIndex]);
      this.drawShape(p, x, y, s, shape, randomFactor, animOffset);
    }
  }
  
  // New pattern: Concentric circles/rings
  drawConcentricPattern(p: p5 | p5.Graphics, colors: string[], count: number, size: number, randomFactor: number, shape: string, animOffset: number = 0) {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    const maxRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.45;
    
    for (let i = 0; i < count; i++) {
      const radius = (maxRadius * i) / count;
      const circumference = 2 * Math.PI * radius;
      const itemCount = Math.max(6, Math.floor(circumference / (size * 0.8)));
      
      for (let j = 0; j < itemCount; j++) {
        // Add animation to angle for rotation effect
        const angle = (j / itemCount) * Math.PI * 2 + (animOffset ? animOffset * (i % 2 ? 0.02 : -0.02) : 0);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const s = size * (1 - randomFactor * 0.3 + p.random(randomFactor * 0.6));
        const colorIndex = (i + j) % colors.length;
        
        p.fill(colors[colorIndex]);
        this.drawShape(p, x, y, s, shape, randomFactor, animOffset);
      }
    }
  }
  
  // New pattern: Radial rays
  drawRadialPattern(p: p5 | p5.Graphics, colors: string[], count: number, size: number, randomFactor: number, shape: string, animOffset: number = 0) {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    const maxRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.5;
    const rays = Math.min(count, 36);
    
    for (let i = 0; i < rays; i++) {
      // Add animation to angle for rotation effect
      const angle = (i / rays) * Math.PI * 2 + (animOffset ? animOffset * 0.03 : 0);
      const rayLength = maxRadius * (0.7 + p.random(0.3));
      const itemsPerRay = Math.max(5, Math.floor(count / rays));
      
      for (let j = 0; j < itemsPerRay; j++) {
        const distRatio = j / itemsPerRay;
        const x = centerX + rayLength * distRatio * Math.cos(angle);
        const y = centerY + rayLength * distRatio * Math.sin(angle);
        const s = size * (1 - 0.5 * distRatio) * (1 - randomFactor * 0.3 + p.random(randomFactor * 0.6));
        const colorIndex = (i + j) % colors.length;
        
        p.fill(colors[colorIndex]);
        this.drawShape(p, x, y, s, shape, randomFactor, animOffset);
      }
    }
  }
  
  // Draw a specific shape
  drawShape(p: p5 | p5.Graphics, x: number, y: number, size: number, shape: string, randomFactor: number, animOffset: number = 0) {
    const rotation = p.random(p.TWO_PI) + (animOffset ? animOffset * 0.2 : 0);
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
      case 'star':
        this.drawStar(p, 0, 0, size/2, size/4, 5);
        break;
      case 'polygon':
        this.drawPolygon(p, 0, 0, size/2, 6);
        break;
      case 'cross':
        p.rect(-size/6, -size/2, size/3, size);
        p.rect(-size/2, -size/6, size, size/3);
        break;
      case 'diamond':
        p.quad(0, -size/2, size/2, 0, 0, size/2, -size/2, 0);
        break;
    }
    
    p.pop();
  }
  
  // Helper methods for new shapes
  drawStar(p: p5 | p5.Graphics, x: number, y: number, radius1: number, radius2: number, npoints: number) {
    p.beginShape();
    for (let i = 0; i < npoints * 2; i++) {
      const radius = i % 2 === 0 ? radius1 : radius2;
      const angle = p.map(i, 0, npoints * 2, 0, p.TWO_PI);
      const sx = x + p.cos(angle) * radius;
      const sy = y + p.sin(angle) * radius;
      p.vertex(sx, sy);
    }
    p.endShape(p.CLOSE);
  }
  
  drawPolygon(p: p5 | p5.Graphics, x: number, y: number, radius: number, npoints: number) {
    p.beginShape();
    for (let i = 0; i < npoints; i++) {
      const angle = p.TWO_PI * i / npoints;
      const sx = x + p.cos(angle) * radius;
      const sy = y + p.sin(angle) * radius;
      p.vertex(sx, sy);
    }
    p.endShape(p.CLOSE);
  }
  
  // Apply filter effects
  applyFilters(p: p5) {
    if (!this.params || this.params.filterEffect === 'none') return;
    
    const intensity = this.params.filterIntensity / 100;
    
    // Create a temporary buffer to apply filters
    const tempBuffer = p.createGraphics(this.canvasWidth, this.canvasHeight);
    // Draw the current state to the buffer
    tempBuffer.image(p as any, 0, 0);
    
    // Apply selected filter
    switch (this.params.filterEffect) {
      case 'blur':
        p.filter(p.BLUR, intensity * 5);
        break;
      case 'pixelate':
        this.applyPixelateFilter(p, tempBuffer, Math.max(2, Math.floor(intensity * 20)));
        break;
      case 'glitch':
        this.applyGlitchFilter(p, tempBuffer, intensity);
        break;
      case 'duotone':
        this.applyDuotoneFilter(p, intensity);
        break;
      case 'noise':
        this.applyNoiseFilter(p, intensity);
        break;
      case 'vignette':
        this.applyVignetteFilter(p, intensity);
        break;
    }
  }
  
  applyPixelateFilter(p: p5, buffer: p5.Graphics, pixelSize: number) {
    p.clear();
    buffer.loadPixels();
    
    for (let x = 0; x < this.canvasWidth; x += pixelSize) {
      for (let y = 0; y < this.canvasHeight; y += pixelSize) {
        // Sample color from center of the block
        const centerX = Math.min(x + Math.floor(pixelSize/2), this.canvasWidth - 1);
        const centerY = Math.min(y + Math.floor(pixelSize/2), this.canvasHeight - 1);
        
        const idx = 4 * (centerY * this.canvasWidth + centerX);
        const r = buffer.pixels[idx];
        const g = buffer.pixels[idx + 1];
        const b = buffer.pixels[idx + 2];
        
        // Draw block
        p.noStroke();
        p.fill(r, g, b);
        p.rect(x, y, pixelSize, pixelSize);
      }
    }
  }
  
  applyGlitchFilter(p: p5, buffer: p5.Graphics, intensity: number) {
    p.clear();
    
    // Draw the original image
    p.image(buffer, 0, 0);
    
    // Add glitch effects
    const glitchCount = Math.floor(intensity * 20);
    
    for (let i = 0; i < glitchCount; i++) {
      // Random position for glitch effect
      const x = p.random(this.canvasWidth);
      const y = p.random(this.canvasHeight);
      const w = p.random(20, 100) * intensity;
      const h = p.random(5, 20);
      
      // Random offset for the slice
      const offsetX = p.random(-20, 20) * intensity;
      
      // Get a slice of the canvas and draw it with offset
      const sourceX = Math.max(0, x - offsetX);
      p.copy(buffer, sourceX, y, w, h, x, y, w, h);
      
      // Add color channel shifting
      if (p.random() < 0.5) {
        p.blendMode(p.ADD);
        p.tint(255, 0, 0, 50 * intensity);
        p.image(buffer, p.random(-10, 10) * intensity, 0);
        p.tint(0, 0, 255, 50 * intensity);
        p.image(buffer, p.random(-10, 10) * intensity, 0);
        p.blendMode(p.BLEND);
        p.noTint();
      }
    }
  }
  
  applyDuotoneFilter(p: p5, intensity: number) {
    p.loadPixels();
    
    const color1 = p.color('#6366F1'); // Primary color
    const color2 = p.color('#EC4899'); // Secondary color
    
    for (let x = 0; x < this.canvasWidth; x++) {
      for (let y = 0; y < this.canvasHeight; y++) {
        const idx = 4 * (y * this.canvasWidth + x);
        
        // Calculate grayscale value
        const r = p.pixels[idx];
        const g = p.pixels[idx + 1];
        const b = p.pixels[idx + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Normalize to 0-1
        const normalizedGray = gray / 255;
        
        // Interpolate between the two colors
        const resultColor = p.lerpColor(color1, color2, normalizedGray);
        
        // Blend with original based on intensity
        const finalColor = p.lerpColor(p.color(r, g, b), resultColor, intensity);
        
        p.pixels[idx] = p.red(finalColor);
        p.pixels[idx + 1] = p.green(finalColor);
        p.pixels[idx + 2] = p.blue(finalColor);
      }
    }
    
    p.updatePixels();
  }
  
  applyNoiseFilter(p: p5, intensity: number) {
    p.loadPixels();
    
    for (let x = 0; x < this.canvasWidth; x++) {
      for (let y = 0; y < this.canvasHeight; y++) {
        const idx = 4 * (y * this.canvasWidth + x);
        
        if (p.random() < intensity * 0.2) {
          const noiseAmount = p.random(-intensity * 50, intensity * 50);
          
          p.pixels[idx] = p.constrain(p.pixels[idx] + noiseAmount, 0, 255);
          p.pixels[idx + 1] = p.constrain(p.pixels[idx + 1] + noiseAmount, 0, 255);
          p.pixels[idx + 2] = p.constrain(p.pixels[idx + 2] + noiseAmount, 0, 255);
        }
      }
    }
    
    p.updatePixels();
  }
  
  applyVignetteFilter(p: p5, intensity: number) {
    p.loadPixels();
    
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
    
    for (let x = 0; x < this.canvasWidth; x++) {
      for (let y = 0; y < this.canvasHeight; y++) {
        const idx = 4 * (y * this.canvasWidth + x);
        
        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate vignette factor (1 at center, 0 at edges)
        const vignetteFactorRaw = 1 - (distance / maxDist);
        const vignetteFactor = Math.pow(vignetteFactorRaw, 2 + intensity * 3);
        
        // Apply vignette effect
        p.pixels[idx] = p.pixels[idx] * vignetteFactor;
        p.pixels[idx + 1] = p.pixels[idx + 1] * vignetteFactor;
        p.pixels[idx + 2] = p.pixels[idx + 2] * vignetteFactor;
      }
    }
    
    p.updatePixels();
  }

  // Export methods
  getCanvas(): HTMLCanvasElement | null {
    if (!this.p5Instance) return null;
    return this.p5Instance.drawingContext.canvas as HTMLCanvasElement || null;
  }
  
  generateSVG(): string {
    if (!this.p5Instance || !this.params) return '';
    
    // Create SVG header
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.canvasWidth}" height="${this.canvasHeight}">`;
    
    // Add background
    svg += `<rect width="100%" height="100%" fill="${this.params.backgroundColor}" />`;
    
    // TODO: Implement full SVG export for all patterns and shapes
    // This is a simplified implementation that doesn't handle all features
    
    svg += `</svg>`;
    return svg;
  }

  destroy() {
    this.animationActive = false;
    
    // Dispose of buffers
    this.buffers.forEach(buffer => {
      buffer.remove();
    });
    this.buffers.clear();
    
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
  }
}
