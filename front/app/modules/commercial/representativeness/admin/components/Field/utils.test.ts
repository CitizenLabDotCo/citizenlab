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
      id123: 1000,
      id456: 1000,
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
    const formValues: FormValues = {};

    const referenceDistribution = null;

    expect(getSubmitAction(formValues, referenceDistribution)).toBeNull();
  });

  it("returns 'create' if local data not empty and remote data empty", () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1000,
    };

    const referenceDistribution = null;

    expect(getSubmitAction(formValues, referenceDistribution)).toBe('create');
  });

  it("returns 'delete' if local data empty and remote data not empty", () => {
    const formValues: FormValues = {};

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

    expect(getSubmitAction(formValues, referenceDistribution)).toBe('delete');
  });

  // it("returns 'replace' if local data differs from remote data", () => {
  //   const formValues = {}
  // })
});

describe('getStatus', () => {
  it('TODO', () => {
    console.log(getStatus);
  });
});
