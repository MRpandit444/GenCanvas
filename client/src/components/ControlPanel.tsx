import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArtParams, ColorPalette, Shape, Pattern, FilterEffect, BlendMode, LayerSettings } from '@/types/art';
import { Plus, Trash, Copy, Eye, EyeOff, Layers } from 'lucide-react';

interface ControlPanelProps {
  params: ArtParams;
  onParamsChange: (params: ArtParams) => void;
  onGenerate: () => void;
}

export default function ControlPanel({ 
  params, 
  onParamsChange, 
  onGenerate 
}: ControlPanelProps) {
  const { toast } = useToast();
  const [updatedParams, setUpdatedParams] = useState<ArtParams>(params);
  const [activeTab, setActiveTab] = useState("basic");
  
  const shapes: Shape[] = [
    { id: 'circle', name: 'Circles', icon: 'circle-line' },
    { id: 'triangle', name: 'Triangles', icon: 'triangle-line' },
    { id: 'rectangle', name: 'Rectangles', icon: 'rectangle-line' },
    { id: 'line', name: 'Lines', icon: 'line-height' },
    { id: 'star', name: 'Stars', icon: 'star-line' },
    { id: 'polygon', name: 'Polygons', icon: 'stop-line' },
    { id: 'cross', name: 'Cross', icon: 'add-line' },
    { id: 'diamond', name: 'Diamond', icon: 'shapes-line' }
  ];
  
  const patterns: Pattern[] = [
    { id: 'scatter', name: 'Random Scatter', icon: 'bubble-chart-line' },
    { id: 'grid', name: 'Grid Pattern', icon: 'layout-grid-line' },
    { id: 'spiral', name: 'Spiral', icon: 'loader-4-line' },
    { id: 'wave', name: 'Wave', icon: 'ripple-line' },
    { id: 'concentric', name: 'Concentric', icon: 'radar-line' },
    { id: 'radial', name: 'Radial', icon: 'record-circle-line' }
  ];
  
  const filterEffects: FilterEffect[] = [
    { id: 'none', name: 'None', icon: 'image-line' },
    { id: 'blur', name: 'Blur', icon: 'blur-off-line' },
    { id: 'pixelate', name: 'Pixelate', icon: 'pixelfed-line' },
    { id: 'glitch', name: 'Glitch', icon: 'error-warning-line' },
    { id: 'duotone', name: 'Duotone', icon: 'contrast-2-line' },
    { id: 'noise', name: 'Noise', icon: 'bubble-chart-line' },
    { id: 'vignette', name: 'Vignette', icon: 'vignette-line' }
  ];
  
  const blendModes: BlendMode[] = [
    { id: 'source-over', name: 'Normal', p5Mode: 'BLEND' },
    { id: 'multiply', name: 'Multiply', p5Mode: 'MULTIPLY' },
    { id: 'screen', name: 'Screen', p5Mode: 'SCREEN' },
    { id: 'overlay', name: 'Overlay', p5Mode: 'OVERLAY' },
    { id: 'darken', name: 'Darken', p5Mode: 'DARKEST' },
    { id: 'lighten', name: 'Lighten', p5Mode: 'LIGHTEST' },
    { id: 'color-dodge', name: 'Color Dodge', p5Mode: 'DODGE' },
    { id: 'color-burn', name: 'Color Burn', p5Mode: 'BURN' },
    { id: 'hard-light', name: 'Hard Light', p5Mode: 'HARD_LIGHT' },
    { id: 'soft-light', name: 'Soft Light', p5Mode: 'SOFT_LIGHT' },
    { id: 'difference', name: 'Difference', p5Mode: 'DIFFERENCE' },
    { id: 'exclusion', name: 'Exclusion', p5Mode: 'EXCLUSION' },
  ];

  useEffect(() => {
    setUpdatedParams(params);
  }, [params]);

  const handleChange = (field: keyof ArtParams, value: any) => {
    const newParams = { ...updatedParams, [field]: value };
    setUpdatedParams(newParams);
    onParamsChange(newParams);
  };

  const updateCustomPalette = () => {
    const customPaletteIndex = updatedParams.colorPalettes.length - 1;
    const customColor = updatedParams.customColor;
    
    // Create a new palette based on the selected color using shade variations
    const newColorPalettes = [...updatedParams.colorPalettes];
    
    // Generate complementary and analogous colors
    // This is a simple implementation
    const hex = customColor.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Lighter shade
    const lighterColor = `#${Math.min(255, r + 60).toString(16).padStart(2, '0')}${Math.min(255, g + 60).toString(16).padStart(2, '0')}${Math.min(255, b + 60).toString(16).padStart(2, '0')}`;
    
    // Darker shade
    const darkerColor = `#${Math.max(0, r - 60).toString(16).padStart(2, '0')}${Math.max(0, g - 60).toString(16).padStart(2, '0')}${Math.max(0, b - 60).toString(16).padStart(2, '0')}`;
    
    // Complementary-ish color (this is a simplification)
    const complementaryColor = `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`;
    
    newColorPalettes[customPaletteIndex] = {
      ...newColorPalettes[customPaletteIndex],
      colors: [customColor, lighterColor, darkerColor, complementaryColor]
    };
    
    const newParams = {
      ...updatedParams,
      colorPalettes: newColorPalettes,
      palette: customPaletteIndex
    };
    
    setUpdatedParams(newParams);
    onParamsChange(newParams);
    
    toast({
      title: "Custom palette created",
      description: "Your custom color palette has been applied"
    });
  };

  // Layer functions
  const handleLayerChange = (index: number, field: keyof LayerSettings, value: any) => {
    const newLayers = [...updatedParams.layers];
    newLayers[index] = { ...newLayers[index], [field]: value };
    
    handleChange('layers', newLayers);
  };

  const addLayer = () => {
    const newLayer: LayerSettings = {
      id: `layer_${Date.now()}`,
      visible: true,
      opacity: 100,
      blendMode: 'source-over',
      shape: 'circle',
      pattern: 'scatter',
      palette: updatedParams.palette,
      complexity: 50,
      elementSize: 20,
      randomness: 50
    };
    
    const newLayers = [...updatedParams.layers, newLayer];
    handleChange('layers', newLayers);
    handleChange('activeLayer', newLayers.length - 1);
    
    toast({
      title: "Layer added",
      description: `New layer has been added`
    });
  };
  
  const deleteLayer = (index: number) => {
    if (updatedParams.layers.length <= 1) {
      toast({
        title: "Cannot delete layer",
        description: "You must have at least one layer",
        variant: "destructive"
      });
      return;
    }
    
    const newLayers = [...updatedParams.layers];
    newLayers.splice(index, 1);
    
    // Update active layer index if needed
    let newActiveLayer = updatedParams.activeLayer;
    if (newActiveLayer >= newLayers.length) {
      newActiveLayer = newLayers.length - 1;
    }
    
    handleChange('layers', newLayers);
    handleChange('activeLayer', newActiveLayer);
    
    toast({
      title: "Layer deleted",
      description: "Layer has been removed"
    });
  };
  
  const duplicateLayer = (index: number) => {
    const sourceLayer = updatedParams.layers[index];
    const newLayer: LayerSettings = {
      ...sourceLayer,
      id: `layer_${Date.now()}`
    };
    
    const newLayers = [...updatedParams.layers];
    newLayers.splice(index + 1, 0, newLayer);
    
    handleChange('layers', newLayers);
    handleChange('activeLayer', index + 1);
    
    toast({
      title: "Layer duplicated",
      description: "Layer has been duplicated"
    });
  };
  
  const toggleLayerVisibility = (index: number) => {
    const newLayers = [...updatedParams.layers];
    newLayers[index] = { 
      ...newLayers[index], 
      visible: !newLayers[index].visible 
    };
    
    handleChange('layers', newLayers);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-3 sm:p-5 h-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800 pb-2 border-b border-gray-100">Art Controls</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-6 pt-2">
          {/* Color Palette */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Color Palette</Label>
            
            {/* Preset Palettes */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {updatedParams.colorPalettes.map((palette, index) => (
                <div 
                  key={index}
                  onClick={() => handleChange('palette', index)}
                  className={`flex p-1 rounded-md hover:bg-gray-100 cursor-pointer ${updatedParams.palette === index ? 'bg-gray-100' : ''}`}
                >
                  {palette.colors.slice(0, 3).map((color, colorIndex) => (
                    <div 
                      key={colorIndex} 
                      className="w-6 h-6 rounded-full mr-1 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Custom Color Selection */}
            <div className="mt-3">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Custom Color</Label>
              <div className="flex items-center">
                <input 
                  type="color" 
                  value={updatedParams.customColor}
                  onChange={(e) => handleChange('customColor', e.target.value)}
                  className="h-8 w-10 cursor-pointer border border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">{updatedParams.customColor}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={updateCustomPalette}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
          
          {/* Shapes */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Shapes</Label>
            <div className="grid grid-cols-4 gap-2">
              {shapes.map((shape) => (
                <div 
                  key={shape.id}
                  onClick={() => handleChange('shape', shape.id)}
                  className={`flex flex-col items-center p-2 rounded-md cursor-pointer transition-all border-2 ${
                    updatedParams.shape === shape.id 
                      ? 'border-primary bg-primary-50' 
                      : 'border-transparent hover:translate-y-[-2px]'
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <i className={`ri-${shape.icon} text-xl`}></i>
                  </div>
                  <span className="text-xs mt-1">{shape.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Patterns */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Pattern</Label>
            <div className="grid grid-cols-2 gap-3">
              {patterns.map((pattern) => (
                <div 
                  key={pattern.id}
                  onClick={() => handleChange('pattern', pattern.id)}
                  className={`flex items-center p-3 rounded-md cursor-pointer transition-all border-2 ${
                    updatedParams.pattern === pattern.id 
                      ? 'border-primary bg-primary-50' 
                      : 'border-transparent hover:translate-y-[-2px]'
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-2">
                    <i className={`ri-${pattern.icon} text-lg`}></i>
                  </div>
                  <span className="text-sm">{pattern.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Complexity Slider */}
          <div className="mb-6">
            <div className="flex justify-between">
              <Label className="text-sm font-medium text-gray-700 mb-2">Complexity</Label>
              <span className="text-sm text-gray-500">{updatedParams.complexity}</span>
            </div>
            <Slider
              value={[updatedParams.complexity]}
              min={10}
              max={200}
              step={5}
              className="w-full"
              onValueChange={(value) => handleChange('complexity', value[0])}
            />
          </div>
          
          {/* Size Slider */}
          <div className="mb-6">
            <div className="flex justify-between">
              <Label className="text-sm font-medium text-gray-700 mb-2">Element Size</Label>
              <span className="text-sm text-gray-500">{updatedParams.elementSize}</span>
            </div>
            <Slider
              value={[updatedParams.elementSize]}
              min={5}
              max={50}
              step={1}
              className="w-full"
              onValueChange={(value) => handleChange('elementSize', value[0])}
            />
          </div>
          
          {/* Randomness Slider */}
          <div className="mb-6">
            <div className="flex justify-between">
              <Label className="text-sm font-medium text-gray-700 mb-2">Randomness</Label>
              <span className="text-sm text-gray-500">{updatedParams.randomness}%</span>
            </div>
            <Slider
              value={[updatedParams.randomness]}
              min={0}
              max={100}
              step={5}
              className="w-full"
              onValueChange={(value) => handleChange('randomness', value[0])}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6 pt-2">
          {/* Background Controls */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Background</Label>
            
            <div className="flex items-center mb-3">
              <Switch
                checked={updatedParams.useGradientBackground}
                onCheckedChange={(checked) => handleChange('useGradientBackground', checked)}
                id="gradient-switch"
              />
              <Label htmlFor="gradient-switch" className="ml-2">Use Gradient Background</Label>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <div>
                <Label className="text-xs mb-1 block">Start Color</Label>
                <div className="flex items-center">
                  <input 
                    type="color" 
                    value={updatedParams.backgroundColor}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="h-8 w-10 cursor-pointer border border-gray-300 rounded"
                  />
                </div>
              </div>
              
              {updatedParams.useGradientBackground && (
                <div>
                  <Label className="text-xs mb-1 block">End Color</Label>
                  <div className="flex items-center">
                    <input 
                      type="color" 
                      value={updatedParams.backgroundEndColor}
                      onChange={(e) => handleChange('backgroundEndColor', e.target.value)}
                      className="h-8 w-10 cursor-pointer border border-gray-300 rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Animation Controls */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Animation</Label>
            
            <div className="flex items-center mb-3">
              <Switch
                checked={updatedParams.animated}
                onCheckedChange={(checked) => handleChange('animated', checked)}
                id="animation-switch"
              />
              <Label htmlFor="animation-switch" className="ml-2">Enable Animation</Label>
            </div>
            
            {updatedParams.animated && (
              <div className="mb-3">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-600 mb-1">Animation Speed</Label>
                  <span className="text-sm text-gray-500">{updatedParams.animationSpeed}</span>
                </div>
                <Slider
                  value={[updatedParams.animationSpeed]}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                  onValueChange={(value) => handleChange('animationSpeed', value[0])}
                />
              </div>
            )}
          </div>
          
          {/* Filter Effects */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Filter Effects</Label>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              {filterEffects.map((effect) => (
                <div 
                  key={effect.id}
                  onClick={() => handleChange('filterEffect', effect.id)}
                  className={`flex flex-col items-center p-2 rounded-md cursor-pointer transition-all border-2 ${
                    updatedParams.filterEffect === effect.id 
                      ? 'border-primary bg-primary-50' 
                      : 'border-transparent hover:translate-y-[-2px]'
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className={`ri-${effect.icon} text-lg`}></i>
                  </div>
                  <span className="text-xs mt-1">{effect.name}</span>
                </div>
              ))}
            </div>
            
            {updatedParams.filterEffect !== 'none' && (
              <div className="mb-3">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-600 mb-1">Effect Intensity</Label>
                  <span className="text-sm text-gray-500">{updatedParams.filterIntensity}%</span>
                </div>
                <Slider
                  value={[updatedParams.filterIntensity]}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                  onValueChange={(value) => handleChange('filterIntensity', value[0])}
                />
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="layers" className="space-y-6 pt-2">
          {/* Layer List */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <Label className="block text-sm font-medium text-gray-700">Layers</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={addLayer}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Layer
              </Button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {updatedParams.layers.map((layer, index) => (
                <div 
                  key={layer.id}
                  className={`flex items-center justify-between p-2 rounded-md border cursor-pointer ${
                    updatedParams.activeLayer === index ? 'bg-primary/10 border-primary' : 'border-gray-200'
                  }`}
                  onClick={() => handleChange('activeLayer', index)}
                >
                  <div className="flex items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(index); }}
                      className="mr-2 text-gray-500 hover:text-gray-700"
                    >
                      {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <span className="text-sm font-medium">{`Layer ${index + 1}`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateLayer(index); }}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteLayer(index); }}
                      className="text-gray-500 hover:text-red-500 p-1"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Layer Settings */}
          {updatedParams.layers[updatedParams.activeLayer] && (
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 pb-1 border-b border-gray-100">
                Layer {updatedParams.activeLayer + 1} Settings
              </div>
              
              {/* Layer Opacity */}
              <div>
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-600 mb-1">Opacity</Label>
                  <span className="text-sm text-gray-500">
                    {updatedParams.layers[updatedParams.activeLayer].opacity}%
                  </span>
                </div>
                <Slider
                  value={[updatedParams.layers[updatedParams.activeLayer].opacity]}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                  onValueChange={(value) => handleLayerChange(updatedParams.activeLayer, 'opacity', value[0])}
                />
              </div>
              
              {/* Blend Mode */}
              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Blend Mode</Label>
                <select 
                  value={updatedParams.layers[updatedParams.activeLayer].blendMode}
                  onChange={(e) => handleLayerChange(updatedParams.activeLayer, 'blendMode', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  {blendModes.map(mode => (
                    <option key={mode.id} value={mode.id}>{mode.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Layer Shape */}
              <div>
                <Label className="block text-sm text-gray-600 mb-1">Shape</Label>
                <div className="grid grid-cols-4 gap-2">
                  {shapes.map((shape) => (
                    <div 
                      key={shape.id}
                      onClick={() => handleLayerChange(updatedParams.activeLayer, 'shape', shape.id)}
                      className={`flex flex-col items-center p-1 rounded-md cursor-pointer transition-all border-2 ${
                        updatedParams.layers[updatedParams.activeLayer].shape === shape.id 
                          ? 'border-primary bg-primary-50' 
                          : 'border-transparent hover:translate-y-[-2px]'
                      }`}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <i className={`ri-${shape.icon} text-sm`}></i>
                      </div>
                      <span className="text-xs mt-1">{shape.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Layer Pattern */}
              <div>
                <Label className="block text-sm text-gray-600 mb-1">Pattern</Label>
                <div className="grid grid-cols-3 gap-2">
                  {patterns.map((pattern) => (
                    <div 
                      key={pattern.id}
                      onClick={() => handleLayerChange(updatedParams.activeLayer, 'pattern', pattern.id)}
                      className={`flex flex-col items-center p-1 rounded-md cursor-pointer transition-all border-2 ${
                        updatedParams.layers[updatedParams.activeLayer].pattern === pattern.id 
                          ? 'border-primary bg-primary-50' 
                          : 'border-transparent hover:translate-y-[-2px]'
                      }`}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <i className={`ri-${pattern.icon} text-sm`}></i>
                      </div>
                      <span className="text-xs mt-1">{pattern.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Generate Button */}
      <Button 
        onClick={onGenerate}
        className="w-full py-4 sm:py-6 mt-4 bg-primary hover:bg-primary/90 text-white font-semibold"
      >
        <span className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>
          Generate New Artwork
        </span>
      </Button>
    </div>
  );
}
