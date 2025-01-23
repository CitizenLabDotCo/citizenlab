import { ImageSizes } from 'typings';

import { ResultLogic } from 'api/survey_results/types';

export type Answer = {
  label: string;
  image?: ImageSizes;
  count: number;
  percentage: number;
  bars: Bar[];
  logicFilterId: string | null;
  logic: ResultLogic;
};

export type Bar = {
  type: BarType;
  percentage: number;
  count: number;
  color: string;
};

export type BarType = 'first' | 'middle' | 'last' | 'single';
