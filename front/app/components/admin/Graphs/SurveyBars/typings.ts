export type BarType = 'first' | 'middle' | 'last' | 'single';

export interface BarProps {
  type?: BarType;
  percentage: number;
  color?: string;
}
