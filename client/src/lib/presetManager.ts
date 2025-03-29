import { ArtParams, Preset, ArtTheme } from '@/types/art';

// Default presets
const defaultPresets: Preset[] = [
  {
    id: 'abstract-waves',
    name: 'Abstract Waves',
    description: 'Colorful wave patterns with smooth transitions',
    settings: {
      palette: 2,
      colorPalettes: [], // Will be populated from the main app
      customColor: '#3b82f6',
      shape: 'circle',
      pattern: 'wave',
      complexity: 20,
      elementSize: 40,
      randomness: 30,
      animated: true,
      animationSpeed: 1.5,
      useGradientBackground: true,
      backgroundColor: '#111827',
      backgroundEndColor: '#1e293b',
      filterEffect: 'noise',
      filterIntensity: 10,
      layers: [
        {
          id: 'layer-1',
          visible: true,
          opacity: 80,
          blendMode: 'screen',
          shape: 'circle',
          pattern: 'wave',
          palette: 2,
          complexity: 20,
          elementSize: 40,
          randomness: 30,
        },
        {
          id: 'layer-2',
          visible: true,
          opacity: 60,
          blendMode: 'multiply',
          shape: 'triangle',
          pattern: 'spiral',
          palette: 3,
          complexity: 15,
          elementSize: 30,
          randomness: 40,
        }
      ],
      activeLayer: 0
    },
    createdAt: Date.now()
  },
  {
    id: 'geometric-playground',
    name: 'Geometric Playground',
    description: 'Sharp geometric shapes in a playful arrangement',
    settings: {
      palette: 4,
      colorPalettes: [], // Will be populated from the main app
      customColor: '#ec4899',
      shape: 'rectangle',
      pattern: 'grid',
      complexity: 15,
      elementSize: 35,
      randomness: 50,
      animated: false,
      animationSpeed: 0,
      useGradientBackground: false,
      backgroundColor: '#f8fafc',
      backgroundEndColor: '#f8fafc',
      filterEffect: 'none',
      filterIntensity: 0,
      layers: [
        {
          id: 'layer-1',
          visible: true,
          opacity: 100,
          blendMode: 'normal',
          shape: 'rectangle',
          pattern: 'grid',
          palette: 4,
          complexity: 15,
          elementSize: 35,
          randomness: 50,
        }
      ],
      activeLayer: 0
    },
    createdAt: Date.now()
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Vibrant neon colors on a dark background',
    settings: {
      palette: 1,
      colorPalettes: [], // Will be populated from the main app
      customColor: '#10b981',
      shape: 'line',
      pattern: 'radial',
      complexity: 25,
      elementSize: 20,
      randomness: 30,
      animated: true,
      animationSpeed: 0.8,
      useGradientBackground: true,
      backgroundColor: '#0f172a',
      backgroundEndColor: '#1e1b4b',
      filterEffect: 'glitch',
      filterIntensity: 20,
      layers: [
        {
          id: 'layer-1',
          visible: true,
          opacity: 90,
          blendMode: 'screen',
          shape: 'line',
          pattern: 'radial',
          palette: 1,
          complexity: 25,
          elementSize: 20,
          randomness: 30,
        }
      ],
      activeLayer: 0
    },
    createdAt: Date.now()
  }
];

// Art history style themes
const artThemes: ArtTheme[] = [
  {
    id: 'mondrian',
    name: 'Mondrian',
    description: 'Primary colors with straight lines inspired by Piet Mondrian',
    settings: {
      palette: 0,
      shape: 'rectangle',
      pattern: 'grid',
      complexity: 10,
      elementSize: 80,
      randomness: 0,
      animated: false,
      useGradientBackground: false,
      backgroundColor: '#ffffff',
      filterEffect: 'none',
    }
  },
  {
    id: 'kandinsky',
    name: 'Kandinsky',
    description: 'Abstract forms and vivid colors inspired by Wassily Kandinsky',
    settings: {
      palette: 3,
      shape: 'circle',
      pattern: 'scatter',
      complexity: 30,
      elementSize: 40,
      randomness: 70,
      animated: true,
      useGradientBackground: true,
      backgroundColor: '#f5f5f4',
      backgroundEndColor: '#fafaf9',
      filterEffect: 'none',
    }
  },
  {
    id: 'pollock',
    name: 'Pollock',
    description: 'Drip-inspired pattern with chaotic arrangement',
    settings: {
      palette: 6,
      shape: 'circle',
      pattern: 'scatter',
      complexity: 100,
      elementSize: 5,
      randomness: 100,
      animated: false,
      useGradientBackground: false,
      backgroundColor: '#fafafa',
      filterEffect: 'noise',
      filterIntensity: 5,
    }
  },
  {
    id: 'warhol',
    name: 'Warhol',
    description: 'Bold, colorful pop art inspired by Andy Warhol',
    settings: {
      palette: 5,
      shape: 'rectangle',
      pattern: 'grid',
      complexity: 16,
      elementSize: 60,
      randomness: 0,
      animated: false,
      useGradientBackground: false,
      backgroundColor: '#ffffff',
      filterEffect: 'duotone',
      filterIntensity: 50,
    }
  }
];

// In-memory storage for user presets
let userPresets: Preset[] = [];

// Load presets from local storage
export function loadUserPresets(): Preset[] {
  try {
    const savedPresets = localStorage.getItem('userPresets');
    if (savedPresets) {
      userPresets = JSON.parse(savedPresets);
    }
  } catch (error) {
    console.error('Failed to load user presets:', error);
  }
  
  return userPresets;
}

// Save a preset
export function savePreset(name: string, settings: ArtParams, thumbnail?: string): Preset {
  const id = `preset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const newPreset: Preset = {
    id,
    name,
    settings,
    thumbnail,
    createdAt: Date.now()
  };
  
  userPresets.push(newPreset);
  
  try {
    localStorage.setItem('userPresets', JSON.stringify(userPresets));
  } catch (error) {
    console.error('Failed to save preset:', error);
  }
  
  return newPreset;
}

// Delete a preset
export function deletePreset(id: string): boolean {
  const initialLength = userPresets.length;
  userPresets = userPresets.filter(preset => preset.id !== id);
  
  try {
    localStorage.setItem('userPresets', JSON.stringify(userPresets));
    return userPresets.length < initialLength;
  } catch (error) {
    console.error('Failed to delete preset:', error);
    return false;
  }
}

// Get all presets (default + user)
export function getAllPresets(colorPalettes: any[]): Preset[] {
  // Inject color palettes into default presets
  const populatedDefaultPresets = defaultPresets.map(preset => ({
    ...preset,
    settings: {
      ...preset.settings,
      colorPalettes
    }
  }));
  
  return [...populatedDefaultPresets, ...userPresets];
}

// Get art style themes
export function getArtThemes(): ArtTheme[] {
  return artThemes;
}

// Apply a theme to current settings
export function applyTheme(currentSettings: ArtParams, themeId: string): ArtParams {
  const theme = artThemes.find(t => t.id === themeId);
  if (!theme) return currentSettings;
  
  return {
    ...currentSettings,
    ...theme.settings
  };
}