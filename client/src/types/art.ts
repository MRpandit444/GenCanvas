export interface ArtParams {
  palette: number;
  colorPalettes: ColorPalette[];
  customColor: string;
  shape: string;
  pattern: string;
  complexity: number;
  elementSize: number;
  randomness: number;
}

export interface ColorPalette {
  name: string;
  colors: string[];
}

export interface SavedArtwork {
  id?: string;
  imageUrl: string;
  settings: ArtParams;
  createdAt?: number;
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
