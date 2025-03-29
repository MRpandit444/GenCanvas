import { ArtParams } from '@/types/art';
import { ArtGenerator } from './artGenerator';

export enum InteractionMode {
  NONE = 'none',
  FOLLOW = 'follow',
  REPEL = 'repel',
  ATTRACT = 'attract',
  DRAW = 'draw',
  EXPAND = 'expand'
}

export class InteractionManager {
  private generator: ArtGenerator | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private mode: InteractionMode = InteractionMode.NONE;
  private isActive: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  // Track previous mouse positions for delay effect
  private mousePositionHistory: Array<{x: number, y: number}> = [];
  private historyMaxLength: number = 20; // Maximum number of positions to remember
  private lastUpdateTime: number = 0;
  private interactionParams: Record<string, any> = {
    strength: 50, // 0-100
    radius: 150,  // pixels
    fadeSpeed: 3, // 1-10
    delay: 5, // 1-10 delay factor (higher means more delay)
    particles: [] // For drawing mode
  };
  private interactions: Map<InteractionMode, (p: any, params: ArtParams) => void> = new Map();

  constructor() {
    // Initialize interaction handlers
    this.interactions.set(InteractionMode.FOLLOW, this.handleFollow.bind(this));
    this.interactions.set(InteractionMode.REPEL, this.handleRepel.bind(this));
    this.interactions.set(InteractionMode.ATTRACT, this.handleAttract.bind(this));
    this.interactions.set(InteractionMode.DRAW, this.handleDraw.bind(this));
    this.interactions.set(InteractionMode.EXPAND, this.handleExpand.bind(this));
  }

  initialize(generator: ArtGenerator, canvas: HTMLCanvasElement) {
    // Clean up previous instance if any
    if (this.canvas) {
      console.log('Cleaning up previous canvas before initializing');
      this.destroy();
    }
    
    this.generator = generator;
    this.canvas = canvas;
    
    // Add event listeners with proper binding
    if (canvas) {
      // Store bound references to ensure proper removal later
      this._boundMouseMove = this.onMouseMove.bind(this);
      this._boundMouseDown = this.onMouseDown.bind(this);
      this._boundMouseUp = this.onMouseUp.bind(this);
      this._boundMouseLeave = this.onMouseLeave.bind(this);
      this._boundTouchMove = this.onTouchMove.bind(this);
      this._boundTouchStart = this.onTouchStart.bind(this);
      this._boundTouchEnd = this.onTouchEnd.bind(this);
      
      // Add listeners - use try/catch to handle errors gracefully
      try {
        canvas.addEventListener('mousemove', this._boundMouseMove);
        canvas.addEventListener('mousedown', this._boundMouseDown);
        canvas.addEventListener('mouseup', this._boundMouseUp);
        canvas.addEventListener('mouseleave', this._boundMouseLeave);
        canvas.addEventListener('touchmove', this._boundTouchMove);
        canvas.addEventListener('touchstart', this._boundTouchStart);
        canvas.addEventListener('touchend', this._boundTouchEnd);
        
        // Initialize mouse history with current mouse position or center of canvas
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        this.mouseX = centerX;
        this.mouseY = centerY;
        this.updateMouseHistory(centerX, centerY);
        
        console.log('InteractionManager initialized with canvas:', canvas);
      } catch (error) {
        console.error('Error setting up event listeners:', error);
      }
    } else {
      console.warn('Cannot initialize InteractionManager: canvas is null');
    }
  }
  
  // Store bound event listeners for proper cleanup
  private _boundMouseMove: ((e: MouseEvent) => void) = () => {};
  private _boundMouseDown: ((e: MouseEvent) => void) = () => {};
  private _boundMouseUp: ((e: MouseEvent) => void) = () => {};
  private _boundMouseLeave: ((e: MouseEvent) => void) = () => {};
  private _boundTouchMove: ((e: TouchEvent) => void) = () => {};
  private _boundTouchStart: ((e: TouchEvent) => void) = () => {};
  private _boundTouchEnd: ((e: TouchEvent) => void) = () => {};

  setMode(mode: InteractionMode) {
    this.mode = mode;
    // Reset interaction-specific state when changing modes
    if (mode === InteractionMode.DRAW) {
      this.interactionParams.particles = [];
    }
  }

  setParams(params: Record<string, any>) {
    this.interactionParams = {
      ...this.interactionParams,
      ...params
    };
  }

  getMode(): InteractionMode {
    return this.mode;
  }

  isInteractive(): boolean {
    return this.mode !== InteractionMode.NONE;
  }

  getMousePosition(): { x: number, y: number } {
    return { x: this.mouseX, y: this.mouseY };
  }

  applyInteraction(p: any, params: ArtParams) {
    if (!this.isInteractive() || !this.isActive) return;
    
    const handler = this.interactions.get(this.mode);
    if (handler) {
      handler(p, params);
    }
  }

  // Event handlers
  private onMouseMove(e: MouseEvent) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    this.isActive = true;
    
    // Update mouse position history for delay effect
    const now = Date.now();
    if (now - this.lastUpdateTime > 30) { // Update history at most 30ms apart
      this.updateMouseHistory(this.mouseX, this.mouseY);
      this.lastUpdateTime = now;
    }
  }
  
  // Function to update mouse position history for delay effects
  private updateMouseHistory(x: number, y: number) {
    this.mousePositionHistory.unshift({ x, y });
    // Keep history size limited
    if (this.mousePositionHistory.length > this.historyMaxLength) {
      this.mousePositionHistory.pop();
    }
  }

  private onMouseDown(e: MouseEvent) {
    if (this.mode === InteractionMode.DRAW) {
      this.isActive = true;
      // Start a new particle path when drawing
      this.interactionParams.particles.push({
        path: [],
        color: this.getRandomColor(),
        size: Math.random() * 10 + 5
      });
    }
  }

  private onMouseUp(_: MouseEvent) {
    if (this.mode === InteractionMode.DRAW) {
      // End the current drawing path
    }
  }

  private onMouseLeave(_: MouseEvent) {
    this.isActive = false;
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.canvas || e.touches.length === 0) return;
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.mouseX = touch.clientX - rect.left;
    this.mouseY = touch.clientY - rect.top;
    this.isActive = true;
    
    // Update mouse position history for delay effect
    const now = Date.now();
    if (now - this.lastUpdateTime > 30) { // Update history at most 30ms apart
      this.updateMouseHistory(this.mouseX, this.mouseY);
      this.lastUpdateTime = now;
    }
    
    // For drawing mode, add point to current path
    if (this.mode === InteractionMode.DRAW && this.interactionParams.particles.length > 0) {
      const currentPath = this.interactionParams.particles[this.interactionParams.particles.length - 1];
      currentPath.path.push({ x: this.mouseX, y: this.mouseY });
    }
  }

  private onTouchStart(e: TouchEvent) {
    if (!this.canvas || e.touches.length === 0) return;
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.mouseX = touch.clientX - rect.left;
    this.mouseY = touch.clientY - rect.top;
    this.isActive = true;
    
    if (this.mode === InteractionMode.DRAW) {
      // Start a new particle path for drawing
      this.interactionParams.particles.push({
        path: [{ x: this.mouseX, y: this.mouseY }],
        color: this.getRandomColor(),
        size: Math.random() * 10 + 5
      });
    }
  }

  private onTouchEnd(e: TouchEvent) {
    e.preventDefault();
    // Keep isActive true for a bit to allow for other touch events to start
    setTimeout(() => {
      if (e.touches.length === 0) {
        this.isActive = false;
      }
    }, 100);
  }

  // Interaction handlers
  private handleFollow(p: any, params: ArtParams) {
    // Implementation: Elements follow the mouse with a delay
    if (!this.generator || !this.generator.p5Instance) return;
    
    const p5 = this.generator.p5Instance;
    const strength = this.interactionParams.strength / 100;
    const radius = this.interactionParams.radius;
    const delayFactor = this.interactionParams.delay || 5; // Control how much delay/lag in the trail
    
    // Make sure we have a history of mouse positions
    if (this.mousePositionHistory.length === 0) {
      this.updateMouseHistory(this.mouseX, this.mouseY);
    }
    
    // Apply to all layers
    params.layers.forEach(layer => {
      if (!layer.visible) return;
      
      const buffer = this.generator?.buffers.get(layer.id);
      if (!buffer) return;
      
      buffer.push();
      buffer.translate(buffer.width/2, buffer.height/2);
      
      // Draw elements attracted to mouse with different delays
      const count = Math.max(1, Math.floor(layer.complexity / 2));
      for (let i = 0; i < count; i++) {
        // Calculate delay index based on element index and delay factor
        // This spreads elements through the history trail
        const delayIndex = Math.min(
          this.mousePositionHistory.length - 1,
          Math.floor(i * delayFactor / count)
        );
        
        // Get delayed position from history
        const delayedPosition = this.mousePositionHistory[delayIndex] || { 
          x: this.mouseX, 
          y: this.mouseY 
        };
        
        // Calculate base position in a circle
        const angle = p5.map(i, 0, count, 0, p5.TWO_PI);
        const baseRadius = Math.min(buffer.width, buffer.height) * 0.3;
        const baseX = p5.cos(angle) * baseRadius;
        const baseY = p5.sin(angle) * baseRadius;
        
        // Target is the delayed mouse position
        const targetX = delayedPosition.x - buffer.width/2;
        const targetY = delayedPosition.y - buffer.height/2;
        
        // Interpolate based on strength
        const x = p5.lerp(baseX, targetX, strength);
        const y = p5.lerp(baseY, targetY, strength);
        
        // Draw element with size variation based on position in trail
        const palette = params.colorPalettes[layer.palette];
        if (palette && palette.colors.length > 0) {
          const colorIndex = i % palette.colors.length;
          buffer.fill(palette.colors[colorIndex]);
          buffer.noStroke();
          
          // Scale size based on position in trail (first elements are bigger)
          const sizeFactor = p5.map(delayIndex, 0, Math.min(10, this.mousePositionHistory.length - 1), 1.2, 0.8);
          
          this.generator?.drawShape(
            buffer, 
            x, 
            y, 
            layer.elementSize * sizeFactor, 
            layer.shape,
            layer.randomness / 100,
            0
          );
        }
      }
      
      buffer.pop();
    });
  }

  private handleRepel(p: any, params: ArtParams) {
    // Implementation: Elements move away from the mouse
    if (!this.generator || !this.generator.p5Instance) return;
    
    const p5 = this.generator.p5Instance;
    const strength = this.interactionParams.strength / 50; // Stronger effect
    const radius = this.interactionParams.radius;
    
    // Create repulsion effect
    const canvasCenter = {
      x: this.generator.canvasWidth / 2,
      y: this.generator.canvasHeight / 2
    };
    
    params.layers.forEach(layer => {
      if (!layer.visible) return;
      
      const buffer = this.generator?.buffers.get(layer.id);
      if (!buffer) return;
      
      buffer.push();
      buffer.translate(buffer.width/2, buffer.height/2);
      
      // Number of shapes based on complexity
      const count = Math.ceil(layer.complexity / 2);
      const palette = params.colorPalettes[layer.palette];
      
      for (let i = 0; i < count; i++) {
        // Calculate base position (evenly distributed in a circle)
        const angle = p5.map(i, 0, count, 0, p5.TWO_PI);
        const baseRadius = Math.min(buffer.width, buffer.height) * 0.4;
        const baseX = p5.cos(angle) * baseRadius;
        const baseY = p5.sin(angle) * baseRadius;
        
        // Calculate distance from mouse
        const mouseVec = {
          x: this.mouseX - canvasCenter.x,
          y: this.mouseY - canvasCenter.y
        };
        
        const distToMouse = p5.dist(mouseVec.x, mouseVec.y, baseX, baseY);
        
        // Calculate repulsion vector (away from mouse)
        let repelX = baseX;
        let repelY = baseY;
        
        if (distToMouse < radius) {
          // Calculate repulsion strength based on distance
          const repelStrength = p5.map(distToMouse, 0, radius, strength, 0);
          
          // Direction from mouse to point
          const dirX = baseX - mouseVec.x;
          const dirY = baseY - mouseVec.y;
          
          // Normalize direction vector
          const dirLen = p5.sqrt(dirX * dirX + dirY * dirY);
          const normDirX = dirX / (dirLen || 1);
          const normDirY = dirY / (dirLen || 1);
          
          // Apply repulsion
          repelX = baseX + normDirX * repelStrength * 50;
          repelY = baseY + normDirY * repelStrength * 50;
        }
        
        // Draw shape at repelled position
        if (palette && palette.colors.length > 0) {
          const colorIndex = i % palette.colors.length;
          buffer.fill(palette.colors[colorIndex]);
          buffer.noStroke();
          
          this.generator?.drawShape(
            buffer,
            repelX,
            repelY,
            layer.elementSize * (1 + (distToMouse < radius ? 0.5 : 0)),
            layer.shape,
            layer.randomness / 100,
            0
          );
        }
      }
      
      buffer.pop();
    });
  }

  private handleAttract(p: any, params: ArtParams) {
    // Implementation: Elements are attracted to the mouse
    if (!this.generator || !this.generator.p5Instance) return;
    
    const p5 = this.generator.p5Instance;
    const strength = this.interactionParams.strength / 100;
    const radius = this.interactionParams.radius;
    
    params.layers.forEach(layer => {
      if (!layer.visible) return;
      
      const buffer = this.generator?.buffers.get(layer.id);
      if (!buffer) return;
      
      buffer.push();
      
      // Create a grid of elements
      const gridSize = Math.ceil(Math.sqrt(layer.complexity));
      const cellWidth = buffer.width / gridSize;
      const cellHeight = buffer.height / gridSize;
      const palette = params.colorPalettes[layer.palette];
      
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          // Base position
          const baseX = i * cellWidth + cellWidth/2;
          const baseY = j * cellHeight + cellHeight/2;
          
          // Calculate vector to mouse
          const mouseX = this.mouseX;
          const mouseY = this.mouseY;
          const dx = mouseX - baseX;
          const dy = mouseY - baseY;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          // Apply attraction based on distance
          let x = baseX;
          let y = baseY;
          
          if (dist < radius) {
            // Attraction strength increases as you get closer to the mouse
            const attractStrength = p5.map(dist, radius, 0, 0, strength);
            x = p5.lerp(baseX, mouseX, attractStrength);
            y = p5.lerp(baseY, mouseY, attractStrength);
          }
          
          // Draw the shape
          if (palette && palette.colors.length > 0) {
            const colorIndex = (i + j) % palette.colors.length;
            buffer.fill(palette.colors[colorIndex]);
            buffer.noStroke();
            
            const size = layer.elementSize * (1 - (dist < radius ? dist/radius * 0.5 : 0));
            
            this.generator?.drawShape(
              buffer,
              x,
              y,
              size,
              layer.shape,
              layer.randomness / 100,
              0
            );
          }
        }
      }
      
      buffer.pop();
    });
  }

  private handleDraw(p: any, params: ArtParams) {
    // Implementation: User can draw directly on the canvas
    if (!this.generator || !this.generator.p5Instance) return;
    
    const p5 = this.generator.p5Instance;
    const fadeSpeed = this.interactionParams.fadeSpeed / 10;
    
    // Draw all particles/paths
    p5.push();
    
    this.interactionParams.particles.forEach((particle: any) => {
      if (particle.path.length < 2) return;
      
      p5.noFill();
      p5.stroke(particle.color);
      p5.strokeWeight(particle.size);
      
      p5.beginShape();
      particle.path.forEach((point: {x: number, y: number}) => {
        p5.vertex(point.x, point.y);
      });
      p5.endShape();
      
      // Fade out over time
      const newColor = p5.color(particle.color);
      const currentAlpha = p5.alpha(newColor);
      if (currentAlpha > 0) {
        const r = p5.red(newColor);
        const g = p5.green(newColor);
        const b = p5.blue(newColor);
        const newAlpha = Math.max(0, currentAlpha - fadeSpeed);
        const fadedColor = p5.color(r, g, b, newAlpha);
        particle.color = fadedColor.toString();
      }
    });
    
    // Remove fully faded particles
    this.interactionParams.particles = this.interactionParams.particles.filter(
      (particle: any) => p5.alpha(p5.color(particle.color)) > 0
    );
    
    p5.pop();
  }

  private handleExpand(p: any, params: ArtParams) {
    // Implementation: Elements expand/grow when mouse is nearby
    if (!this.generator || !this.generator.p5Instance) return;
    
    const p5 = this.generator.p5Instance;
    const strength = this.interactionParams.strength / 100;
    const radius = this.interactionParams.radius;
    
    params.layers.forEach(layer => {
      if (!layer.visible) return;
      
      const buffer = this.generator?.buffers.get(layer.id);
      if (!buffer) return;
      
      buffer.push();
      
      // Create a pattern based on the layer settings
      const pattern = layer.pattern;
      const palette = params.colorPalettes[layer.palette];
      
      if (pattern === 'grid') {
        const gridSize = Math.ceil(Math.sqrt(layer.complexity));
        const cellWidth = buffer.width / gridSize;
        const cellHeight = buffer.height / gridSize;
        
        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            const x = i * cellWidth + cellWidth/2;
            const y = j * cellHeight + cellHeight/2;
            
            // Calculate distance to mouse
            const dist = p5.dist(this.mouseX, this.mouseY, x, y);
            
            // Size changes based on proximity to mouse
            let sizeFactor = 1;
            if (dist < radius) {
              // Size increases as mouse gets closer
              sizeFactor = 1 + strength * (1 - dist/radius) * 3;
            }
            
            // Draw shape with modified size
            if (palette && palette.colors.length > 0) {
              const colorIndex = (i + j) % palette.colors.length;
              buffer.fill(palette.colors[colorIndex]);
              buffer.noStroke();
              
              this.generator?.drawShape(
                buffer,
                x,
                y,
                layer.elementSize * sizeFactor,
                layer.shape,
                layer.randomness / 100,
                0
              );
            }
          }
        }
      } else if (pattern === 'scatter' || pattern === 'random') {
        // Use p5's random seed to ensure consistent random patterns
        const randSeed = p5.random(10000);
        p5.randomSeed(randSeed);
        
        for (let i = 0; i < layer.complexity; i++) {
          const x = p5.random(buffer.width);
          const y = p5.random(buffer.height);
          
          // Calculate distance to mouse
          const dist = p5.dist(this.mouseX, this.mouseY, x, y);
          
          // Size changes based on proximity to mouse
          let sizeFactor = 1;
          if (dist < radius) {
            // Size increases as mouse gets closer
            sizeFactor = 1 + strength * (1 - dist/radius) * 3;
          }
          
          // Draw shape with modified size
          if (palette && palette.colors.length > 0) {
            const colorIndex = i % palette.colors.length;
            buffer.fill(palette.colors[colorIndex]);
            buffer.noStroke();
            
            this.generator?.drawShape(
              buffer,
              x,
              y,
              layer.elementSize * sizeFactor,
              layer.shape,
              layer.randomness / 100,
              0
            );
          }
        }
      } else {
        // For other patterns, fall back to the standard implementation
        // but still apply the expansion effect
        this.generator?.drawLayerToBuffer(buffer, layer);
      }
      
      buffer.pop();
    });
  }

  private getRandomColor(): string {
    if (!this.generator?.p5Instance) return '#ffffff';
    
    const p5 = this.generator.p5Instance;
    const hue = p5.random(360);
    const saturation = 80 + p5.random(20);
    const brightness = 80 + p5.random(20);
    
    p5.colorMode(p5.HSB, 360, 100, 100);
    const color = p5.color(hue, saturation, brightness);
    p5.colorMode(p5.RGB, 255, 255, 255);
    
    return color.toString();
  }

  // Cleanup
  destroy() {
    if (this.canvas) {
      // Remove event listeners using the bound functions
      if (this._boundMouseMove) this.canvas.removeEventListener('mousemove', this._boundMouseMove);
      if (this._boundMouseDown) this.canvas.removeEventListener('mousedown', this._boundMouseDown);
      if (this._boundMouseUp) this.canvas.removeEventListener('mouseup', this._boundMouseUp);
      if (this._boundMouseLeave) this.canvas.removeEventListener('mouseleave', this._boundMouseLeave);
      if (this._boundTouchMove) this.canvas.removeEventListener('touchmove', this._boundTouchMove);
      if (this._boundTouchStart) this.canvas.removeEventListener('touchstart', this._boundTouchStart);
      if (this._boundTouchEnd) this.canvas.removeEventListener('touchend', this._boundTouchEnd);
      
      console.log('InteractionManager destroyed, removed event listeners');
    }
    
    // Clear all data
    this.generator = null;
    this.canvas = null;
    this.isActive = false;
    this.mousePositionHistory = [];
    this.interactionParams.particles = [];
  }
}