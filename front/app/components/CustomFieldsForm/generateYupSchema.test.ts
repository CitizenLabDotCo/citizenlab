import { IFlatCustomField } from 'api/custom_fields/types';

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

    it('does not make other field required if otherTextOptional is set', () => {
      const lenientSchema = generateYupSchema({
        pageQuestions,
        formatMessage,
        localize,
        otherTextOptional: true,
      });
      expect(lenientSchema.isValidSync({ select_q: 'other' })).toBe(true);
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

    it('does not make other field required if otherTextOptional is set', () => {
      const lenientSchema = generateYupSchema({
        pageQuestions,
        formatMessage,
        localize,
        otherTextOptional: true,
      });
      expect(
        lenientSchema.isValidSync({ multiselect_q: ['Value', 'other'] })
      ).toBe(true);
    });
  });

  describe('birthyear field', () => {
    const birthyearQuestion = (key: string): IFlatCustomField => ({
      id: `${key}-id`,
      type: 'custom_field',
      key,
      title_multiloc: { en: 'Year of birth' },
      description_multiloc: {},
      input_type: 'number',
      required: false,
      answers_visible_to: 'moderators',
      show_as_filter: false,
      enabled: true,
      ordering: 0,
      created_at: '',
      updated_at: '',
      logic: {},
    });

    it.each(['birthyear', 'u_birthyear'])(
      'rejects a year before 1900 for %s',
      (key) => {
        const schema = generateYupSchema({
          pageQuestions: [birthyearQuestion(key)],
          formatMessage,
          localize,
        });

        expect(schema.isValidSync({ [key]: 1363 })).toBe(false);
        expect(schema.isValidSync({ [key]: 1963 })).toBe(true);
      }
    );
  });
});
