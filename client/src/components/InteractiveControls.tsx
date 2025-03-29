import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractionMode } from '@/lib/interactionManager';
import { useToast } from '@/hooks/use-toast';
import { Hand, MousePointer, Magnet, Wand, PenTool, Maximize } from 'lucide-react';

interface InteractionParams {
  strength: number;
  radius: number;
  fadeSpeed: number;
  [key: string]: any; // Allow additional properties
}

interface InteractiveControlsProps {
  onModeChange: (mode: InteractionMode) => void;
  onParamsChange: (params: Partial<InteractionParams>) => void;
  currentMode: InteractionMode;
}

export default function InteractiveControls({
  onModeChange,
  onParamsChange,
  currentMode
}: InteractiveControlsProps) {
  const { toast } = useToast();
  const [params, setParams] = useState<InteractionParams>({
    strength: 50,
    radius: 150,
    fadeSpeed: 3,
    delay: 5
  });

  // Update interaction parameters when they change
  useEffect(() => {
    onParamsChange(params);
  }, [params, onParamsChange]);

  const handleModeChange = (mode: InteractionMode) => {
    console.log('InteractiveControls: Setting mode to:', mode);
    
    // Apply the change
    onModeChange(mode);
    
    // Show toast with instructions based on mode
    let toastMessage = '';
    switch (mode) {
      case InteractionMode.NONE:
        toastMessage = 'Interactive mode disabled';
        break;
      case InteractionMode.FOLLOW:
        toastMessage = 'Elements will follow your cursor with a trailing effect';
        break;
      case InteractionMode.REPEL:
        toastMessage = 'Elements will move away from your cursor';
        break;
      case InteractionMode.ATTRACT:
        toastMessage = 'Elements will be attracted to your cursor';
        break;
      case InteractionMode.DRAW:
        toastMessage = 'Click and drag to draw directly on the canvas';
        break;
      case InteractionMode.EXPAND:
        toastMessage = 'Elements will expand when your cursor is nearby';
        break;
    }
    
    // Log active parameters for debugging
    console.log('Current interaction params:', params);
    
    if (toastMessage) {
      toast({ title: toastMessage });
    }
  };
  
  const handleStrengthChange = (value: number[]) => {
    setParams(prev => ({ ...prev, strength: value[0] }));
  };
  
  const handleRadiusChange = (value: number[]) => {
    setParams(prev => ({ ...prev, radius: value[0] }));
  };
  
  const handleFadeSpeedChange = (value: number[]) => {
    setParams(prev => ({ ...prev, fadeSpeed: value[0] }));
  };
  
  const handleDelayChange = (value: number[]) => {
    setParams(prev => ({ ...prev, delay: value[0] }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Interactive Mode</CardTitle>
        <CardDescription>
          Interact with your artwork in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mode" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="mode">Mode</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mode" className="space-y-4 mt-2">
            <RadioGroup 
              value={currentMode} 
              onValueChange={(val) => handleModeChange(val as InteractionMode)}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <RadioGroupItem value={InteractionMode.NONE} id="none" />
                <Label htmlFor="none" className="flex items-center gap-2 cursor-pointer text-sm">
                  <MousePointer size={16} className="flex-shrink-0" />
                  <span>None</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <RadioGroupItem value={InteractionMode.FOLLOW} id="follow" />
                <Label htmlFor="follow" className="flex items-center gap-2 cursor-pointer text-sm">
                  <Hand size={16} className="flex-shrink-0" />
                  <span>Follow</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <RadioGroupItem value={InteractionMode.REPEL} id="repel" />
                <Label htmlFor="repel" className="flex items-center gap-2 cursor-pointer text-sm">
                  <Magnet size={16} className="transform rotate-180 flex-shrink-0" />
                  <span>Repel</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <RadioGroupItem value={InteractionMode.ATTRACT} id="attract" />
                <Label htmlFor="attract" className="flex items-center gap-2 cursor-pointer text-sm">
                  <Magnet size={16} className="flex-shrink-0" />
                  <span>Attract</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <RadioGroupItem value={InteractionMode.DRAW} id="draw" />
                <Label htmlFor="draw" className="flex items-center gap-2 cursor-pointer text-sm">
                  <PenTool size={16} className="flex-shrink-0" />
                  <span>Draw</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <RadioGroupItem value={InteractionMode.EXPAND} id="expand" />
                <Label htmlFor="expand" className="flex items-center gap-2 cursor-pointer text-sm">
                  <Maximize size={16} className="flex-shrink-0" />
                  <span>Expand</span>
                </Label>
              </div>
            </RadioGroup>
            
            <div className="pt-2 text-sm text-muted-foreground">
              {currentMode === InteractionMode.NONE && (
                <p>Select an interaction mode to play with your artwork</p>
              )}
              {currentMode === InteractionMode.FOLLOW && (
                <p>Elements will follow your cursor with a smooth trailing motion effect</p>
              )}
              {currentMode === InteractionMode.REPEL && (
                <p>Elements will be pushed away from your cursor</p>
              )}
              {currentMode === InteractionMode.ATTRACT && (
                <p>Elements will be pulled toward your cursor</p>
              )}
              {currentMode === InteractionMode.DRAW && (
                <p>Click and drag to draw directly on the canvas</p>
              )}
              {currentMode === InteractionMode.EXPAND && (
                <p>Elements will grow larger when your cursor is nearby</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Strength</Label>
                  <span className="text-sm text-muted-foreground">{params.strength}%</span>
                </div>
                <Slider 
                  value={[params.strength]} 
                  min={0} 
                  max={100} 
                  step={1} 
                  onValueChange={handleStrengthChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Radius</Label>
                  <span className="text-sm text-muted-foreground">{params.radius}px</span>
                </div>
                <Slider 
                  value={[params.radius]} 
                  min={50} 
                  max={300} 
                  step={10} 
                  onValueChange={handleRadiusChange}
                />
              </div>
              
              {currentMode === InteractionMode.FOLLOW && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Trail Delay</Label>
                    <span className="text-sm text-muted-foreground">{params.delay}</span>
                  </div>
                  <Slider 
                    value={[params.delay]} 
                    min={1} 
                    max={10} 
                    step={1} 
                    onValueChange={handleDelayChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher values create longer trails with more lag between elements
                  </p>
                </div>
              )}
              
              {currentMode === InteractionMode.DRAW && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Fade Speed</Label>
                    <span className="text-sm text-muted-foreground">{params.fadeSpeed}</span>
                  </div>
                  <Slider 
                    value={[params.fadeSpeed]} 
                    min={1} 
                    max={10} 
                    step={1} 
                    onValueChange={handleFadeSpeedChange}
                  />
                </div>
              )}
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Adjust these settings to fine-tune the interactive behavior
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-center sm:justify-end mt-4">
          <Button
            variant={currentMode === InteractionMode.NONE ? "outline" : "default"}
            onClick={() => handleModeChange(
              currentMode === InteractionMode.NONE ? InteractionMode.FOLLOW : InteractionMode.NONE
            )}
            className="flex items-center gap-2 w-full sm:w-auto"
            size="sm"
          >
            {currentMode === InteractionMode.NONE ? (
              <>
                <Wand size={16} />
                <span>Enable Interactive Mode</span>
              </>
            ) : (
              <>
                <MousePointer size={16} />
                <span>Disable Interactive Mode</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}