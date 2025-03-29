import { useEffect, useRef, useState } from 'react';
import { ArtGenerator } from '@/lib/artGenerator';
import { InteractionManager, InteractionMode } from '@/lib/interactionManager';
import { ArtParams, SavedArtwork } from '@/types/art';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, Download as SVGIcon } from 'lucide-react';

interface ArtCanvasProps {
  params: ArtParams;
  isGenerating: boolean;
  onArtworkGenerated: (artwork: SavedArtwork) => void;
  generatorRef?: React.MutableRefObject<ArtGenerator | null>;
  interactionMode?: InteractionMode;
  interactionParams?: Record<string, any>;
}

export default function ArtCanvas({
  params,
  isGenerating,
  onArtworkGenerated,
  generatorRef,
  interactionMode = InteractionMode.NONE,
  interactionParams = {}
}: ArtCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [artGenerator, setArtGenerator] = useState<ArtGenerator | null>(null);
  const [interactionManager, setInteractionManager] = useState<InteractionManager | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (containerRef.current && !artGenerator) {
      const generator = new ArtGenerator();
      generator.initialize(containerRef.current, params);
      setArtGenerator(generator);
      
      if (generatorRef) {
        generatorRef.current = generator;
      }
      
      // Store reference to the canvas
      setTimeout(() => {
        if (generator.p5Instance) {
          // Get the canvas element from the DOM since it's not directly accessible via p5 instance
          const canvasElement = containerRef.current?.querySelector('canvas');
          if (canvasElement) {
            canvasRef.current = canvasElement;
            
            // Initialize interaction manager
            const manager = new InteractionManager();
            manager.initialize(generator, canvasElement);
            setInteractionManager(manager);
          }
        }
        setCanvasReady(true);
      }, 100);
    }

    return () => {
      if (interactionManager) {
        interactionManager.destroy();
        setInteractionManager(null);
      }
      
      if (artGenerator) {
        artGenerator.destroy();
        setArtGenerator(null);
        if (generatorRef) {
          generatorRef.current = null;
        }
      }
    };
  }, []);

  useEffect(() => {
    if (artGenerator && canvasReady) {
      artGenerator.updateParams(params);
      
      // After generating, save the artwork
      if (isGenerating) {
        setTimeout(() => {
          const canvas = artGenerator.getCanvas();
          if (canvas) {
            const imageUrl = canvas.toDataURL('image/png');
            onArtworkGenerated({
              imageUrl,
              settings: { ...params },
              format: "png"
            });
          }
        }, 200); // Small delay to ensure canvas is rendered
      }
    }
  }, [params, isGenerating, canvasReady]);
  
  // Handle interaction mode changes
  useEffect(() => {
    if (interactionManager) {
      interactionManager.setMode(interactionMode);
      
      // Modify the p5 draw function to include interactions
      if (artGenerator && artGenerator.p5Instance) {
        const oldDraw = artGenerator.p5Instance.draw;
        
        // Override the p5 draw function to include interactions
        artGenerator.p5Instance.draw = () => {
          // First do the normal drawing
          oldDraw();
          
          // Then apply the interaction effects
          if (interactionMode !== InteractionMode.NONE) {
            interactionManager.applyInteraction(artGenerator.p5Instance, params);
          }
        };
      }
    }
  }, [interactionMode, interactionManager]);
  
  // Handle interaction parameter changes
  useEffect(() => {
    if (interactionManager) {
      interactionManager.setParams(interactionParams);
    }
  }, [interactionParams, interactionManager]);

  const handleSVGExport = () => {
    if (artGenerator) {
      const svgContent = artGenerator.generateSVG();
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const link = document.createElement('a');
      link.href = svgUrl;
      link.download = `artgen-${timestamp}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(svgUrl);
      
      // Also save to gallery with SVG format
      onArtworkGenerated({
        imageUrl: svgUrl,
        settings: { ...params },
        format: "svg"
      });
    }
  };

  // Calculate canvas size based on container and device
  const getCanvasSize = () => {
    if (typeof window !== 'undefined') {
      const maxWidth = Math.min(window.innerWidth - 40, 800);
      const height = maxWidth * 0.75; // 4:3 aspect ratio
      return { width: maxWidth, height };
    }
    return { width: 600, height: 450 };
  };

  const canvasSize = getCanvasSize();

  return (
    <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800">Your Artwork</h2>
        <div className="flex space-x-2">
          {isGenerating && (
            <span className="text-sm text-primary animate-pulse">Generating...</span>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleSVGExport}
            disabled={!canvasReady || isGenerating}
          >
            <SVGIcon className="h-4 w-4 mr-1" />
            Export SVG
          </Button>
        </div>
      </div>
      
      <div className="relative">
        {!canvasReady && (
          <Skeleton className="w-full h-[400px] rounded-lg" />
        )}
        <div 
          id="canvas-container" 
          ref={containerRef} 
          className="w-full overflow-hidden rounded-lg"
          style={{ 
            display: canvasReady ? 'block' : 'none',
            height: `${canvasSize.height}px`,
            maxWidth: `${canvasSize.width}px`,
            margin: '0 auto'
          }}
        >
          {/* p5.js canvas will be injected here */}
        </div>
      </div>
      
      {params.animated && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          Animation is active. The artwork will evolve over time.
        </div>
      )}
    </div>
  );
}
