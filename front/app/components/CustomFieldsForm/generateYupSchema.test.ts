import generateYupSchema from './generateYupSchema';

describe('generateYupSchema', () => {
  const formatMessage = () => 'formatMessage';
  const localize = () => 'localize';

  describe('select field', () => {
    const pageQuestions = [
      {
        input_type: 'select',
        required: true,
        key: 'select_q',
      },
    ] as any;

    const schema = generateYupSchema({
      pageQuestions,
      formatMessage,
      localize,
    });
    it('does not make other field required is not other', () => {
      expect(schema.isValidSync({ select_q: 'Value' })).toBe(true);
    });

    it('makes other field required if value is other', () => {
      expect(schema.isValidSync({ select_q: 'other' })).toBe(false);
      expect(
        schema.isValidSync({ select_q: 'other', select_q_other: 'Bla' })
      ).toBe(true);
    });
  });

  describe('multiselect field', () => {
    const pageQuestions = [
      {
        input_type: 'multiselect',
        required: true,
        key: 'multiselect_q',
      },
    ] as any;

    const schema = generateYupSchema({
      pageQuestions,
      formatMessage,
      localize,
    });

    it('does not crash if no values are provided', () => {
      expect(schema.isValidSync({})).toBe(false);
    });

    it('does not make other field required if values do not contain other', () => {
      expect(schema.isValidSync({ multiselect_q: ['Value'] })).toBe(true);
    });

    it('makes other field required if values contain other', () => {
      expect(schema.isValidSync({ multiselect_q: ['Value', 'other'] })).toBe(
        false
      );
      expect(
        schema.isValidSync({
          multiselect_q: ['Value', 'other'],
          multiselect_q_other: 'Bla',
        })
      ).toBe(true);
    });
  });

  describe('number field', () => {
    const buildSchema = (required: boolean, key = 'number_q') =>
      generateYupSchema({
        pageQuestions: [
          { input_type: 'number', required, key, enabled: true },
        ] as any,
        formatMessage,
        localize,
      });

    it('accepts a valid number when required', () => {
      expect(buildSchema(true).isValidSync({ number_q: 42 })).toBe(true);
    });

    it('rejects an empty value when required', () => {
      expect(buildSchema(true).isValidSync({ number_q: '' })).toBe(false);
    });

    it('accepts an empty value when optional', () => {
      expect(buildSchema(false).isValidSync({ number_q: '' })).toBe(true);
      expect(buildSchema(false).isValidSync({})).toBe(true);
    });

    it('rejects NaN (bad input) whether required or optional', () => {
      expect(buildSchema(true).isValidSync({ number_q: NaN })).toBe(false);
      expect(buildSchema(false).isValidSync({ number_q: NaN })).toBe(false);
    });

    it('rejects NaN for birthyear and proposed_budget too', () => {
      expect(
        buildSchema(true, 'birthyear').isValidSync({ birthyear: NaN })
      ).toBe(false);
      expect(
        buildSchema(true, 'proposed_budget').isValidSync({
          proposed_budget: NaN,
        })
      ).toBe(false);
    });
  });
});
