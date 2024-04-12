import { Keys } from 'utils/cl-react-query/types';

import referenceDistributionKeys from './keys';

export type ReferenceDistributionKeys = Keys<typeof referenceDistributionKeys>;

export interface IReferenceDistribution {
  data: TReferenceDistributionData;
}

export type TReferenceDistributionData =
  | ICategoricalDistributionData
  | IBinnedDistributionData;

export interface ICategoricalDistributionData {
  id: string;
  type: 'categorical_distribution';
  attributes: {
    distribution: TCategoricalDistribution;
  };
  relationships: {
    values: {
      data: { id: string; type: 'custom_field_option' }[];
    };
  };
}

export interface IBinnedDistributionData {
  id: string;
  type: 'binned_distribution';
  attributes: {
    distribution: IBinnedDistribution;
  };
}

export type TCategoricalDistribution = Record<
  string,
  {
    count: number;
    probability: number;
  }
>;

export interface IBinnedDistribution {
  bins: Bins;
  counts: number[];
}

export type Bins = (number | null)[];

export type TUploadDistribution = Record<string, number> | IBinnedDistribution;

export type TAddDistribution = Omit<TUploadDistribution, 'id'> & { id: string };
