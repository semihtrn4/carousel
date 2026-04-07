export interface Project {
  id: string;
  name: string;
  slides: number;
  ratio: 'square' | 'portrait' | 'story' | 'landscape';
  updatedAt: number;
  createdAt: number;
  thumbnail?: string;
  canvasData?: string;
}
