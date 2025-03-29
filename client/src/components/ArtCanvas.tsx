import { useEffect, useRef, useState } from 'react';
import { ArtGenerator } from '@/lib/artGenerator';
import { ArtParams, SavedArtwork } from '@/types/art';
import { Skeleton } from '@/components/ui/skeleton';

interface ArtCanvasProps {
  params: ArtParams;
  isGenerating: boolean;
  onArtworkGenerated: (artwork: SavedArtwork) => void;
  generatorRef?: React.MutableRefObject<ArtGenerator | null>;
}

export default function ArtCanvas({
  params,
  isGenerating,
  onArtworkGenerated,
  generatorRef
}: ArtCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [artGenerator, setArtGenerator] = useState<ArtGenerator | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (containerRef.current && !artGenerator) {
      const generator = new ArtGenerator();
      generator.initialize(containerRef.current, params);
      setArtGenerator(generator);
      
      if (generatorRef) {
        generatorRef.current = generator;
      }
      
      setCanvasReady(true);
    }

    return () => {
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
              settings: { ...params }
            });
          }
        }, 200); // Small delay to ensure canvas is rendered
      }
    }
  }, [params, isGenerating, canvasReady]);

  return (
    <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800">Your Artwork</h2>
        {isGenerating && (
          <span className="text-sm text-primary animate-pulse">Generating...</span>
        )}
      </div>
      
      <div className="relative">
        {!canvasReady && (
          <Skeleton className="w-full h-[400px] rounded-lg" />
        )}
        <div 
          id="canvas-container" 
          ref={containerRef} 
          className="w-full overflow-hidden rounded-lg"
          style={{ display: canvasReady ? 'block' : 'none' }}
        >
          {/* p5.js canvas will be injected here */}
        </div>
      </div>
    </div>
  );
}
