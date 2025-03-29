export interface ArtParams {
  palette: number;
  colorPalettes: ColorPalette[];
  customColor: string;
  shape: string;
  pattern: string;
  complexity: number;
  elementSize: number;
  randomness: number;
  // New parameters
  animated: boolean;
  animationSpeed: number;
  useGradientBackground: boolean;
  backgroundColor: string;
  backgroundEndColor: string;
  filterEffect: string;
  filterIntensity: number;
  layers: LayerSettings[];
  activeLayer: number;
}

export interface ColorPalette {
  name: string;
  colors: string[];
}

export interface LayerSettings {
  id: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  shape: string;
  pattern: string;
  palette: number;
  complexity: number;
  elementSize: number;
  randomness: number;
}

export interface SavedArtwork {
  id?: string;
  imageUrl: string;
  settings: ArtParams;
  createdAt?: number;
  format?: string; // "png" or "svg"
}

export interface Shape {
  id: string;
  name: string;
  icon: string;
}

export interface Pattern {
  id: string;
  name: string;
  icon: string;
}

export interface FilterEffect {
  id: string;
  name: string;
  icon: string;
}

export interface BlendMode {
  id: string;
  name: string;
  p5Mode: string | undefined;
}
