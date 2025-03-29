import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Preset, ArtTheme, ArtParams } from '@/types/art';
import { getAllPresets, savePreset, deletePreset, getArtThemes, applyTheme } from '@/lib/presetManager';
import { useToast } from '@/hooks/use-toast';
import { Bookmark, Trash, Wand2, History, Save, Search } from 'lucide-react';

interface PresetSelectorProps {
  currentParams: ArtParams;
  onSelectPreset: (params: ArtParams) => void;
  onSelectTheme: (params: ArtParams) => void;
  colorPalettes: any[];
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export default function PresetSelector({
  currentParams,
  onSelectPreset,
  onSelectTheme,
  colorPalettes,
  canvasRef
}: PresetSelectorProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [themes, setThemes] = useState<ArtTheme[]>([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('presets');
  const [newPresetName, setNewPresetName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load presets and themes when component mounts
    setPresets(getAllPresets(colorPalettes));
    setThemes(getArtThemes());
  }, [colorPalettes]);

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for your preset',
        variant: 'destructive'
      });
      return;
    }

    // Capture thumbnail from canvas if available
    let thumbnail;
    if (canvasRef?.current) {
      try {
        thumbnail = canvasRef.current.toDataURL('image/png');
      } catch (error) {
        console.error('Failed to capture thumbnail:', error);
      }
    }

    const newPreset = savePreset(newPresetName, currentParams, thumbnail);
    setPresets([...presets, newPreset]);
    setNewPresetName('');
    
    toast({
      title: 'Preset Saved',
      description: `Your preset "${newPresetName}" has been saved`,
    });
  };

  const handleDeletePreset = (id: string, name: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const success = deletePreset(id);
    if (success) {
      setPresets(presets.filter(preset => preset.id !== id));
      toast({
        title: 'Preset Deleted',
        description: `The preset "${name}" has been deleted`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete preset',
        variant: 'destructive'
      });
    }
  };

  const handlePresetSelect = (preset: Preset) => {
    onSelectPreset(preset.settings);
    setOpen(false);
    
    toast({
      title: 'Preset Loaded',
      description: `"${preset.name}" preset has been loaded`,
    });
  };

  const handleThemeSelect = (theme: ArtTheme) => {
    const newParams = applyTheme(currentParams, theme.id);
    onSelectTheme(newParams);
    setOpen(false);
    
    toast({
      title: 'Theme Applied',
      description: `"${theme.name}" style has been applied`,
    });
  };

  // Filter presets based on search query
  const filteredPresets = presets.filter(preset => 
    preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preset.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <Bookmark size={16} className="flex-shrink-0" />
          <span className="sm:inline">Presets & Styles</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Presets & Art Styles</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="presets" className="flex items-center gap-2">
              <Bookmark size={16} />
              <span>Presets</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <History size={16} />
              <span>Art Styles</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search presets..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto p-1">
              {filteredPresets.length > 0 ? (
                filteredPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="border rounded-md p-3 cursor-pointer hover:border-primary transition-all flex flex-col"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm sm:text-base">{preset.name}</h3>
                      {!preset.id.startsWith('preset-') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => handleDeletePreset(preset.id, preset.name, e)}
                          title="Delete preset"
                        >
                          <Trash size={14} />
                        </Button>
                      )}
                    </div>
                    {preset.thumbnail && (
                      <div className="h-20 sm:h-24 w-full overflow-hidden rounded-md mb-2">
                        <img src={preset.thumbnail} alt={preset.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {preset.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{preset.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 text-center py-8">
                  <p className="text-muted-foreground">No presets found</p>
                </div>
              )}
            </div>
            
            <div className="flex items-end gap-2 pt-2 border-t">
              <div className="flex-1">
                <Label htmlFor="preset-name">Save Current Settings</Label>
                <Input
                  id="preset-name"
                  placeholder="Preset name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
              </div>
              <Button onClick={handleSavePreset} className="flex gap-2">
                <Save size={16} />
                <span>Save</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="themes" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Apply art history style themes to your artwork. These will modify your current settings.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
              {themes.map(theme => (
                <div
                  key={theme.id}
                  className="border rounded-md p-3 cursor-pointer hover:border-primary transition-all flex flex-col"
                  onClick={() => handleThemeSelect(theme)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm sm:text-base">{theme.name}</h3>
                    <Wand2 size={16} className="text-primary/70" />
                  </div>
                  {theme.preview && (
                    <div className="h-20 sm:h-24 w-full overflow-hidden rounded-md mb-2">
                      <img src={theme.preview} alt={theme.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{theme.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}