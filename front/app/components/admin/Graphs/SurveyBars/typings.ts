import { ImageSizes } from 'typings';

// TODO: JS - Think this typing is repeated
export type Answer = {
  label: string;
  image?: ImageSizes;
  count: number;
  percentage: number;
  bars: Bar[];
  logicFilterId: string | null;
};

export type Bar = {
  type: BarType;
  percentage: number;
  count: number;
  color: string;
};

export type BarType = 'first' | 'middle' | 'last' | 'single';
