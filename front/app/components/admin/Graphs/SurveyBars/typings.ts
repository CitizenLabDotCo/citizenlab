export interface Props {
  data: Option[];
  colorScheme: string[];
}

export type Option = {
  label: string;
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
