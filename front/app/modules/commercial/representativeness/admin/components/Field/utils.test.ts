import { isFormValid, getSubmitAction, getStatus, FormValues } from './utils';
import {
  IReferenceDistributionData,
  TDistribution,
} from '../../services/referenceDistribution';

const createReferenceDistribution = (
  distribution: TDistribution
): IReferenceDistributionData => ({
  id: 'bla',
  type: 'reference_distribution',
  attributes: { distribution },
  relationships: {
    values: { data: [] },
  },
});

describe('isFormValid', () => {
  it('TODO', () => {
    console.log(isFormValid);
  });
});

describe.only('getSubmitAction', () => {
  it('returns null if local and remote data is identical', () => {
    const formValues: FormValues = {
      id123: {
        population: 1000,
        enabled: true,
      },
      id456: {
        population: 1000,
        enabled: true,
      },
      id789: {
        population: undefined,
        enabled: false,
      },
    };

    const referenceDistribution = createReferenceDistribution({
      id123: {
        count: 1000,
        probability: 0.5,
      },
      id456: {
        count: 1000,
        probability: 0.5,
      },
    });

    expect(getSubmitAction(formValues, referenceDistribution)).toBeNull();
  });

  it('returns null if local and remote data are empty', () => {
    const formValues: FormValues = {
      id123: {
        population: undefined,
        enabled: true,
      },
      id456: {
        population: undefined,
        enabled: true,
      },
    };

    const referenceDistribution = null;

    expect(getSubmitAction(formValues, referenceDistribution)).toBeNull();
  });

  it("returns 'create' if local data not empty and remote data empty", () => {
    const formValues: FormValues = {
      id123: {
        population: 1000,
        enabled: true,
      },
      id456: {
        population: 1000,
        enabled: true,
      },
      id789: {
        population: undefined,
        enabled: false,
      },
    };

    const referenceDistribution = null;

    expect(getSubmitAction(formValues, referenceDistribution)).toBe('create');
  });

  it("returns 'delete' if local data empty and remote data not empty", () => {
    const formValues1: FormValues = {
      id123: {
        population: undefined,
        enabled: false,
      },
    };

    const formValues2: FormValues = {
      id123: {
        population: undefined,
        enabled: false,
      },
      id456: {
        population: undefined,
        enabled: false,
      },
      id789: {
        population: undefined,
        enabled: false,
      },
    };

    const referenceDistribution = createReferenceDistribution({
      id123: {
        count: 1000,
        probability: 0.5,
      },
      id456: {
        count: 1000,
        probability: 0.5,
      },
    });

    expect(getSubmitAction(formValues1, referenceDistribution)).toBe('delete');
    expect(getSubmitAction(formValues2, referenceDistribution)).toBe('delete');
  });
});

describe('getStatus', () => {
  it('TODO', () => {
    console.log(getStatus);
  });
});
