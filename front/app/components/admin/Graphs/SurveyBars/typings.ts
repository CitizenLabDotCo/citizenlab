import { ImageSizes } from 'typings';

export type Answer = {
  label: string;
  image?: ImageSizes;
  count: number;
  percentage: number;
  bars: Bar[];
};

type Bar = {
  type: BarType;
  percentage: number;
  color: string;
};

export type BarType = 'first' | 'middle' | 'last' | 'single';

export interface BarProps {
  type?: BarType;
  percentage: number;
  color?: string;
}
