export interface ImageToTextBlock {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImageToTextResponse = ImageToTextBlock[];
