import {
  isFormValid,
  getSubmitAction,
  getStatus,
  isSubmittingAllowed,
  convertBinsToFormValues,
  FormValues,
} from './utils';
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
  it('returns true if form is empty', () => {
    expect(isFormValid({})).toBe(true);
  });

  it('returns true if all enabled options are filled out', () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1000,
    };

    expect(isFormValid(formValues)).toBe(true);
  });

  it('returns false if not all enabled options are filled out', () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1000,
      id789: null,
    };

    expect(isFormValid(formValues)).toBe(false);
  });

  it('returns false if only one option is enabled and filled out', () => {
    const formValues: FormValues = {
      id123: 1000,
    };

    expect(isFormValid(formValues)).toBe(false);
  });
});

describe('getSubmitAction', () => {
  it('returns null if local and remote data are identical', () => {
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

  it("returns 'create' if local data not empty and remote data are empty", () => {
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

  it("returns 'replace' if local data differs from remote data", () => {
    const formValues = {
      id123: 1200,
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

    expect(getSubmitAction(formValues, referenceDistribution)).toBe('replace');
  });
});

describe('getStatus', () => {
  it("returns 'saved' if local and remote data are identical (untouched)", () => {
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

    const touched = false;

    expect(getStatus(formValues, referenceDistribution, touched)).toBe('saved');
  });

  it("returns 'saved' if user just deleted data", () => {
    const formValues = {};
    const referenceDistribution = null;
    const touched = false;

    expect(getStatus(formValues, referenceDistribution, touched)).toBe('saved');
  });

  it("returns 'complete' if local and remote data are identical (touched)", () => {
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

    const touched = true;

    expect(getStatus(formValues, referenceDistribution, touched)).toBe(
      'complete'
    );
  });

  it("returns 'incomplete' if not all enabled options are filled out (remote data)", () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1000,
      id789: null,
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

    const touched = true;

    expect(getStatus(formValues, referenceDistribution, touched)).toBe(
      'incomplete'
    );
  });

  it("returns 'incomplete' if if only one option is enabled and filled out (remote data)", () => {
    const formValues: FormValues = {
      id123: 1000,
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

    const touched = true;

    expect(getStatus(formValues, referenceDistribution, touched)).toBe(
      'incomplete'
    );
  });

  it("returns 'incomplete' if not all enabled options are filled out (no remote data)", () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1000,
      id789: null,
    };

    const referenceDistribution = null;

    const touched = true;

    expect(getStatus(formValues, referenceDistribution, touched)).toBe(
      'incomplete'
    );
  });

  it("returns 'incomplete' if if only one option is enabled and filled out (remote data)", () => {
    const formValues: FormValues = {
      id123: 1000,
    };

    const referenceDistribution = null;

    const touched = true;

    expect(getStatus(formValues, referenceDistribution, touched)).toBe(
      'incomplete'
    );
  });

  it('returns null if local and remote data are both empty', () => {
    const formValues: FormValues = {};
    const referenceDistribution = null;
    const touched = true;

    expect(getStatus(formValues, referenceDistribution, touched)).toBeNull();
  });

  it('returns null if local data is empty but remote is not', () => {
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

    const touched = true;

    expect(getStatus(formValues, referenceDistribution, touched)).toBeNull();
  });

  it('returns null if remote data is empty but locally not all values are disabled', () => {
    const formValues: FormValues = { id1: null };
    const referenceDistribution = null;
    const touched = false;

    expect(getStatus(formValues, referenceDistribution, touched)).toBeNull();
  });
});

describe('isSubmittingAllowed', () => {
  it('returns false if all fields disabled + no remote data', () => {
    expect(isSubmittingAllowed({}, true, false)).toBe(false);
  });

  it('returns true if all fields disabled + remote data', () => {
    expect(isSubmittingAllowed({}, true, true)).toBe(true);
  });

  it('returns false if not all enabled fields filled out', () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1200,
      id789: null,
    };

    expect(isSubmittingAllowed(formValues, true, false)).toBe(false);
  });

  it('returns true if all enabled fields filled out', () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1200,
      id789: 1100,
    };

    expect(isSubmittingAllowed(formValues, true, false)).toBe(true);
  });
});

describe('convertBinsToFormValues', () => {
  it('works with upper bound', () => {
    const bins = [18, 25, 35, 55, 70];

    const expectedFormValues = {
      '18-24': null,
      '25-34': null,
      '35-54': null,
      '55-70': null,
    };

    expect(convertBinsToFormValues(bins)).toEqual(expectedFormValues);
  });

  it('works without upper bound', () => {
    const bins = [18, 25, 35, 55, null];

    const expectedFormValues = {
      '18-24': null,
      '25-34': null,
      '35-54': null,
      '55+': null,
    };

    expect(convertBinsToFormValues(bins)).toEqual(expectedFormValues);
  });
});
