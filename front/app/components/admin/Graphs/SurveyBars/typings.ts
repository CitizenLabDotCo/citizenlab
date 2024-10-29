import { ImageSizes } from 'typings';

export type Answer = {
  label: string;
  image?: ImageSizes;
  count: number;
  percentage: number;
  bars: Bar[];
};

export type Bar = {
  type: BarType;
  percentage: number;
  count: number;
  color: string;
};

export type BarType = 'first' | 'middle' | 'last' | 'single';
