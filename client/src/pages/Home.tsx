import { useState, useEffect, useRef } from 'react';
import { useParams } from 'wouter';
import Header from '@/components/Header';
import ControlPanel from '@/components/ControlPanel';
import ArtCanvas from '@/components/ArtCanvas';
import Gallery from '@/components/Gallery';
import ShareModal from '@/components/ShareModal';
import { ArtGenerator } from '@/lib/artGenerator';
import { ArtParams, ColorPalette, SavedArtwork } from '@/types/art';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const { artId } = useParams();
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedArtworks, setSavedArtworks] = useState<SavedArtwork[]>([]);
  const [sharedArtLoaded, setSharedArtLoaded] = useState(false);
  const generatorRef = useRef<ArtGenerator | null>(null);

  // Default color palettes
  const colorPalettes: ColorPalette[] = [
    { name: 'Ocean', colors: ['#05445E', '#189AB4', '#75E6DA', '#D4F1F9'] },
    { name: 'Sunset', colors: ['#F9ED69', '#F08A5D', '#B83B5E', '#6A2C70'] },
    { name: 'Forest', colors: ['#2D6A4F', '#40916C', '#52B788', '#95D5B2'] },
    { name: 'Retro', colors: ['#FFC857', '#E9724C', '#C5283D', '#481D24'] },
    { name: 'Monochrome', colors: ['#F8F9FA', '#CED4DA', '#6C757D', '#212529'] },
    { name: 'Custom', colors: ['#6366F1', '#EC4899', '#8B5CF6', '#ffffff'] }
  ];

  // Default art parameters
  const [artParams, setArtParams] = useState<ArtParams>({
    palette: 0,
    colorPalettes,
    customColor: '#6366F1',
    shape: 'circle',
    pattern: 'scatter',
    complexity: 50,
    elementSize: 20,
    randomness: 50
  });

  // Load shared artwork if artId is present
  const { data: sharedArtwork, isLoading } = useQuery({
    queryKey: [`/api/artworks/${artId}`],
    enabled: !!artId && !sharedArtLoaded,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity
  });

  // Load saved artworks from localStorage on mount
  useEffect(() => {
    const savedArtworksJson = localStorage.getItem('artgen-saved-artworks');
    if (savedArtworksJson) {
      try {
        const loadedArtworks = JSON.parse(savedArtworksJson);
        setSavedArtworks(loadedArtworks);
      } catch (e) {
        console.error('Failed to load saved artworks:', e);
      }
    }
  }, []);

  // If shared artwork data is loaded, update the art parameters
  useEffect(() => {
    if (sharedArtwork && !sharedArtLoaded) {
      try {
        setArtParams(sharedArtwork.settings);
        setSharedArtLoaded(true);
        toast({
          title: "Shared artwork loaded",
          description: "You are viewing a shared artwork"
        });
      } catch (e) {
        console.error('Failed to load shared artwork:', e);
        toast({
          title: "Error loading shared artwork",
          description: "The shared artwork could not be loaded",
          variant: "destructive"
        });
      }
    }
  }, [sharedArtwork, sharedArtLoaded]);

  // Save artworks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('artgen-saved-artworks', JSON.stringify(savedArtworks));
  }, [savedArtworks]);

  const generateArtwork = () => {
    setIsGenerating(true);
    // The actual generation happens in ArtCanvas component
    setTimeout(() => {
      setIsGenerating(false);
    }, 300);
  };

  const handleArtworkGenerated = (artwork: SavedArtwork) => {
    // Only add if not already generating or if there are less than 6 artworks
    if (savedArtworks.length < 6) {
      setSavedArtworks([...savedArtworks, artwork]);
    } else {
      // Replace the oldest artwork
      setSavedArtworks([...savedArtworks.slice(1), artwork]);
    }
  };

  const resetCanvas = () => {
    // Create random art parameters
    const newParams: ArtParams = {
      ...artParams,
      palette: Math.floor(Math.random() * (colorPalettes.length - 1)), // Exclude custom palette
      shape: ['circle', 'triangle', 'rectangle', 'line'][Math.floor(Math.random() * 4)],
      pattern: ['scatter', 'grid', 'spiral', 'wave'][Math.floor(Math.random() * 4)],
      complexity: Math.floor(Math.random() * 100) + 30,
      elementSize: Math.floor(Math.random() * 30) + 10,
      randomness: Math.floor(Math.random() * 70) + 30
    };
    
    setArtParams(newParams);
    generateArtwork();
  };

  const downloadArtwork = () => {
    if (generatorRef.current) {
      const canvas = generatorRef.current.getCanvas();
      if (canvas) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `artgen-${timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Artwork downloaded",
          description: "Your artwork has been downloaded successfully"
        });
      }
    }
  };

  const downloadFromGallery = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `artgen-gallery-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Artwork downloaded",
      description: "Your gallery artwork has been downloaded successfully"
    });
  };

  const loadFromGallery = (settings: ArtParams) => {
    setArtParams(settings);
    
    toast({
      title: "Artwork loaded",
      description: "Gallery artwork loaded into editor"
    });
  };

  const removeFromGallery = (index: number) => {
    const newArtworks = [...savedArtworks];
    newArtworks.splice(index, 1);
    setSavedArtworks(newArtworks);
    
    toast({
      title: "Artwork removed",
      description: "The artwork has been removed from your gallery"
    });
  };

  const shareArtwork = async () => {
    try {
      // Create a new shared artwork entry on the backend
      if (generatorRef.current) {
        const canvas = generatorRef.current.getCanvas();
        if (canvas) {
          const imageUrl = canvas.toDataURL('image/png');
          const artworkData = {
            imageUrl,
            settings: artParams,
            createdAt: Date.now()
          };
          
          const response = await apiRequest('POST', '/api/artworks', artworkData);
          const data = await response.json();
          
          // Get the URL of the shared artwork
          const host = window.location.origin;
          const shareUrl = `${host}/shared/${data.id}`;
          
          setShareUrl(shareUrl);
          setShowShareModal(true);
        }
      }
    } catch (error) {
      console.error('Error sharing artwork:', error);
      toast({
        title: "Error sharing artwork",
        description: "There was an error sharing your artwork. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-gray-50 font-sans text-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          onReset={resetCanvas}
          onDownload={downloadArtwork}
          onShare={shareArtwork}
        />
        
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <ControlPanel 
            params={artParams}
            onParamsChange={setArtParams}
            onGenerate={generateArtwork}
          />
          
          <div className="md:w-2/3 space-y-6">
            <ArtCanvas 
              params={artParams}
              isGenerating={isGenerating}
              onArtworkGenerated={handleArtworkGenerated}
              generatorRef={generatorRef}
            />
            
            <Gallery 
              artworks={savedArtworks}
              onLoadArtwork={loadFromGallery}
              onDeleteArtwork={removeFromGallery}
              onDownload={downloadFromGallery}
            />
          </div>
        </div>
        
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          shareUrl={shareUrl}
        />
      </div>
    </div>
  );
}
