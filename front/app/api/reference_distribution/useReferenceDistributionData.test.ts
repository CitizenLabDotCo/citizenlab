import { IBinnedDistributionData, ICategoricalDistributionData } from './types';
import { getRemoteFormValues } from './useReferenceDistributionData';

describe('getRemoteFormValues', () => {
  it('works for categorical distributions', () => {
    const categoricalDistribution: ICategoricalDistributionData = {
      id: 'cd1',
      type: 'categorical_distribution',
      attributes: {
        distribution: {
          category1: {
            count: 100,
            probability: 0.25,
          },
          category2: {
            count: 150,
            probability: 0.375,
          },
          category3: {
            count: 50,
            probability: 0.125,
          },
          category4: {
            count: 100,
            probability: 0.25,
          },
        },
      },
      relationships: {
        values: {} as any,
      },
    };

    const expectedRemoteFormValues = {
      category1: 100,
      category2: 150,
      category3: 50,
      category4: 100,
    };

    expect(getRemoteFormValues(categoricalDistribution)).toEqual(
      expectedRemoteFormValues
    );
  });

  it('works for binned distributions (no upper bound)', () => {
    const binnedDistribution: IBinnedDistributionData = {
      id: 'bd1',
      type: 'binned_distribution',
      attributes: {
        distribution: {
          bins: [18, 25, 35, 45, 65, null],
          counts: [100, 150, 50, 200, 30],
        },
      },
    };

    const expectedRemoteFormValues = {
      '18 - 24': 100,
      '25 - 34': 150,
      '35 - 44': 50,
      '45 - 64': 200,
      '65+': 30,
    };

    expect(getRemoteFormValues(binnedDistribution)).toEqual(
      expectedRemoteFormValues
    );
  });

  it('works for binned distributions (no upper bound)', () => {
    const binnedDistribution: any = {
      type: 'binned_distribution',
      attributes: {
        distribution: {
          bins: [18, 25, 35, 45, 65, 80],
          counts: [100, 150, 50, 200, 30],
        },
      },
    };

    const expectedRemoteFormValues = {
      '18 - 24': 100,
      '25 - 34': 150,
      '35 - 44': 50,
      '45 - 64': 200,
      '65 - 80': 30,
    };

    expect(getRemoteFormValues(binnedDistribution)).toEqual(
      expectedRemoteFormValues
    );
  });
});
