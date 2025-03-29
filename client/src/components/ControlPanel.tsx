import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArtParams, ColorPalette, Shape, Pattern } from '@/types/art';

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
  
  const shapes: Shape[] = [
    { id: 'circle', name: 'Circles', icon: 'circle-line' },
    { id: 'triangle', name: 'Triangles', icon: 'triangle-line' },
    { id: 'rectangle', name: 'Rectangles', icon: 'rectangle-line' },
    { id: 'line', name: 'Lines', icon: 'line-height' }
  ];
  
  const patterns: Pattern[] = [
    { id: 'scatter', name: 'Random Scatter', icon: 'bubble-chart-line' },
    { id: 'grid', name: 'Grid Pattern', icon: 'layout-grid-line' },
    { id: 'spiral', name: 'Spiral', icon: 'loader-4-line' },
    { id: 'wave', name: 'Wave', icon: 'ripple-line' }
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

  return (
    <div className="md:w-1/3 bg-white rounded-lg shadow-md p-5 h-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b border-gray-100">Art Controls</h2>
      
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
      
      {/* Generate Button */}
      <Button 
        onClick={onGenerate}
        className="w-full py-6 bg-accent hover:bg-accent/90 text-white"
      >
        <i className="ri-magic-line mr-2"></i> Generate New Artwork
      </Button>
    </div>
  );
}
