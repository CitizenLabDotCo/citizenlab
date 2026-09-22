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

  // Controls that let the user clear their answer write null rather than
  // undefined, because react-hook-form reads an undefined value back as the
  // field's defaultValue.
  describe('answers cleared with null', () => {
    const clearableQuestions = [
      ['linear_scale', {}],
      ['sentiment_linear_scale', {}],
      ['ranking', { options: [{ key: 'a' }, { key: 'b' }] }],
      ['matrix_linear_scale', { matrix_statements: [{ key: 's1' }] }],
    ] as const;

    const schemaFor = (inputType: string, required: boolean, extra: object) =>
      generateYupSchema({
        pageQuestions: [
          { input_type: inputType, required, key: 'q', ...extra },
        ] as any,
        formatMessage,
        localize,
      });

    it.each(clearableQuestions)(
      'accepts null on an optional %s',
      (inputType, extra) => {
        expect(
          schemaFor(inputType, false, extra).isValidSync({ q: null })
        ).toBe(true);
      }
    );

    // Without nullable(), yup reports null as a type error ("must be a
    // `number` type") instead of the translated 'this field is required'.
    it.each(clearableQuestions)(
      'reports null on a required %s as a missing answer',
      (inputType, extra) => {
        expect(() =>
          schemaFor(inputType, true, extra).validateSync({ q: null })
        ).toThrow('formatMessage');
      }
    );
  });
});
