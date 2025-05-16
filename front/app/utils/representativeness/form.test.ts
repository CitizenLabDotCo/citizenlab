import {
  isFormValid,
  FormValues,
  getSubmitAction,
  getStatus,
  isSubmittingAllowed,
  convertBinsToFormValues,
  parseFormValues,
} from './form';

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

    const remoteFormValues = {
      id123: 1000,
      id456: 1000,
    };

    expect(getSubmitAction(formValues, remoteFormValues)).toBeNull();
  });

  it('returns null if local and remote data are empty', () => {
    const formValues: FormValues = {};

    const remoteFormValues = undefined;

    expect(getSubmitAction(formValues, remoteFormValues)).toBeNull();
  });

  it("returns 'create' if local data not empty and remote data are empty", () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1000,
    };

    const remoteFormValues = undefined;

    expect(getSubmitAction(formValues, remoteFormValues)).toBe('create');
  });

  it("returns 'delete' if local data empty and remote data not empty", () => {
    const formValues: FormValues = {};

    const remoteFormValues = {
      id123: 1000,
      id456: 1000,
    };

    expect(getSubmitAction(formValues, remoteFormValues)).toBe('delete');
  });

  it("returns 'replace' if local data differs from remote data", () => {
    const formValues = {
      id123: 1200,
      id456: 1000,
    };

    const remoteFormValues = {
      id123: 1000,
      id456: 1000,
    };

    expect(getSubmitAction(formValues, remoteFormValues)).toBe('replace');
  });
});

describe('getStatus', () => {
  it("returns 'saved' if local and remote data are identical (untouched)", () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1000,
    };

    const remoteFormValues = {
      id123: 1000,
      id456: 1000,
    };

    const touched = false;

    expect(getStatus(formValues, remoteFormValues, touched)).toBe('saved');
  });

  it("returns 'saved' if user just deleted data", () => {
    const formValues = {};
    const remoteFormValues = undefined;
    const touched = false;

    expect(getStatus(formValues, remoteFormValues, touched)).toBe('saved');
  });

  it("returns 'complete' if local and remote data are identical (touched)", () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1000,
    };

    const remoteFormValues = {
      id123: 1000,
      id456: 1000,
    };

    const touched = true;

    expect(getStatus(formValues, remoteFormValues, touched)).toBe('complete');
  });

  it("returns 'incomplete' if not all enabled options are filled out (remote data)", () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1000,
      id789: null,
    };

    const remoteFormValues = {
      id123: 1000,
      id456: 1000,
    };

    const touched = true;

    expect(getStatus(formValues, remoteFormValues, touched)).toBe('incomplete');
  });

  it("returns 'incomplete' if if only one option is enabled and filled out (remote data)", () => {
    const formValues: FormValues = {
      id123: 1000,
    };

    const remoteFormValues = {
      id123: 1000,
      id456: 1000,
    };

    const touched = true;

    expect(getStatus(formValues, remoteFormValues, touched)).toBe('incomplete');
  });

  it("returns 'incomplete' if not all enabled options are filled out (no remote data)", () => {
    const formValues: FormValues = {
      id123: 1000,
      id456: 1000,
      id789: null,
    };

    const remoteFormValues = undefined;

    const touched = true;

    expect(getStatus(formValues, remoteFormValues, touched)).toBe('incomplete');
  });

  it("returns 'incomplete' if if only one option is enabled and filled out (remote data)", () => {
    const formValues: FormValues = {
      id123: 1000,
    };

    const remoteFormValues = undefined;

    const touched = true;

    expect(getStatus(formValues, remoteFormValues, touched)).toBe('incomplete');
  });

  it('returns null if local and remote data are both empty', () => {
    const formValues: FormValues = {};
    const remoteFormValues = undefined;
    const touched = true;

    expect(getStatus(formValues, remoteFormValues, touched)).toBeNull();
  });

  it('returns null if local data is empty but remote is not', () => {
    const formValues: FormValues = {};

    const remoteFormValues = {
      id123: 1000,
      id456: 1000,
    };

    const touched = true;

    expect(getStatus(formValues, remoteFormValues, touched)).toBeNull();
  });

  it('returns null if remote data is empty but locally not all values are disabled', () => {
    const formValues: FormValues = { id1: null };
    const remoteFormValues = undefined;
    const touched = false;

    expect(getStatus(formValues, remoteFormValues, touched)).toBeNull();
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
  describe('no existing formValues', () => {
    it('works with upper bound', () => {
      const bins = [18, 25, 35, 55, 70];

      const expectedFormValues = {
        '18 - 24': null,
        '25 - 34': null,
        '35 - 54': null,
        '55 - 70': null,
      };

      expect(convertBinsToFormValues(bins, null)).toEqual(expectedFormValues);
    });

    it('works without upper bound', () => {
      const bins = [18, 25, 35, 55, null];

      const expectedFormValues = {
        '18 - 24': null,
        '25 - 34': null,
        '35 - 54': null,
        '55+': null,
      };

      expect(convertBinsToFormValues(bins, null)).toEqual(expectedFormValues);
    });
  });

  describe('with existing formValues', () => {
    it('works with upper bound', () => {
      const bins = [18, 25, 37, 55, 70];
      const formValues = {
        '18 - 24': 100,
        '25 - 34': 100,
        '35 - 54': 100,
        '55 - 70': 100,
      };

      const expectedFormValues = {
        '18 - 24': 100,
        '25 - 36': null,
        '37 - 54': null,
        '55 - 70': 100,
      };

      expect(convertBinsToFormValues(bins, formValues)).toEqual(
        expectedFormValues
      );
    });

    it('works without upper bound', () => {
      const bins = [18, 25, 37, 55, null];
      const formValues = {
        '18 - 24': 100,
        '25 - 34': 100,
        '35 - 54': 100,
        '55+': 100,
      };

      const expectedFormValues = {
        '18 - 24': 100,
        '25 - 36': null,
        '37 - 54': null,
        '55+': 100,
      };

      expect(convertBinsToFormValues(bins, formValues)).toEqual(
        expectedFormValues
      );
    });
  });
});

describe('parseFormValues', () => {
  it('works with bins', () => {
    const formValues = {
      '18 - 24': 100,
      '25 - 34': 100,
      '35 - 44': 100,
      '45 - 64': 100,
      '65+': 100,
    };

    const bins = [18, 25, 35, 45, 65, null];

    const expectedOutput = {
      bins,
      counts: [100, 100, 100, 100, 100],
    };

    expect(parseFormValues(formValues, bins)).toEqual(expectedOutput);
  });
});
