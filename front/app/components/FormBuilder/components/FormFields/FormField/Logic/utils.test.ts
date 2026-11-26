import { IFlatCustomField } from 'api/custom_fields/types';

import {
  getLinearOrRatingOptions,
  getLinearScaleRule,
  getOptionRule,
  getTitleFromAnswerId,
  getTitleFromPageId,
} from './utils';

const field = (
  attributes: Partial<IFlatCustomField> &
    Pick<IFlatCustomField, 'id' | 'input_type'>
): IFlatCustomField => ({
  type: 'custom_field',
  key: attributes.id,
  title_multiloc: {},
  description_multiloc: {},
  required: false,
  answers_visible_to: 'moderators',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  ...attributes,
});

const savedOption = { id: 'option-a', title_multiloc: { en: 'Option A' } };
const newOption = { temp_id: 'TEMP-b', title_multiloc: { en: 'Option B' } };

const select = field({
  id: 'q',
  input_type: 'select',
  options: [savedOption, newOption],
  logic: {
    rules: [
      { if: 'option-a', goto_page_id: 'page-2' },
      { if: 'TEMP-b', goto_page_id: '' },
      { if: 'any_other_answer', goto_page_id: 'page-3' },
    ],
  },
});

describe('getOptionRule', () => {
  it('finds the rule of a saved option by its id', () => {
    expect(getOptionRule(savedOption, select)).toEqual({
      if: 'option-a',
      goto_page_id: 'page-2',
    });
  });

  it('ignores a rule without a target page', () => {
    expect(getOptionRule(newOption, select)).toBeUndefined();
  });

  it('finds the rule of a new option by its temporary id', () => {
    const withTarget = field({
      ...select,
      logic: { rules: [{ if: 'TEMP-b', goto_page_id: 'page-2' }] },
    });

    expect(getOptionRule(newOption, withTarget)).toEqual({
      if: 'TEMP-b',
      goto_page_id: 'page-2',
    });
  });

  it('returns nothing for an option without an id', () => {
    expect(getOptionRule({ title_multiloc: {} }, select)).toBeUndefined();
  });
});

describe('getLinearScaleRule', () => {
  it('finds a rule stored with an integer value', () => {
    const scale = field({
      id: 'q',
      input_type: 'linear_scale',
      logic: { rules: [{ if: 3, goto_page_id: 'page-2' }] },
    });

    expect(getLinearScaleRule({ key: 3, label: '3' }, scale)).toEqual({
      if: 3,
      goto_page_id: 'page-2',
    });
  });

  it('does not find a rule stored with a string value, although the survey follows it', () => {
    const scale = field({
      id: 'q',
      input_type: 'linear_scale',
      logic: { rules: [{ if: '3', goto_page_id: 'page-2' }] },
    });

    expect(getLinearScaleRule({ key: 3, label: '3' }, scale)).toBeUndefined();
  });
});

describe('getLinearOrRatingOptions', () => {
  it('lists the values from 1 to the maximum', () => {
    expect(getLinearOrRatingOptions(3)).toEqual([
      { key: 1, label: '1' },
      { key: 2, label: '2' },
      { key: 3, label: '3' },
    ]);
  });
});

describe('getTitleFromAnswerId', () => {
  it('returns scale values as text', () => {
    expect(getTitleFromAnswerId(select, 4, 'en')).toBe('4');
  });

  it('returns the option title for an option id or temporary id', () => {
    expect(getTitleFromAnswerId(select, 'option-a', 'en')).toBe('Option A');
    expect(getTitleFromAnswerId(select, 'TEMP-b', 'en')).toBe('Option B');
  });

  it('returns nothing for catch-all conditions and missing options', () => {
    expect(
      getTitleFromAnswerId(select, 'any_other_answer', 'en')
    ).toBeUndefined();
    expect(getTitleFromAnswerId(select, 'deleted', 'en')).toBeUndefined();
    expect(getTitleFromAnswerId(select, undefined, 'en')).toBeUndefined();
  });

  it('returns nothing without a locale', () => {
    expect(getTitleFromAnswerId(select, 'option-a', null)).toBeUndefined();
  });
});

describe('getTitleFromPageId', () => {
  const fields = [
    field({ id: 'page-1', input_type: 'page' }),
    field({ id: 'page-2', input_type: 'page' }),
    field({ id: 'page-end', key: 'form_end', input_type: 'page' }),
  ];
  const fieldNumbers = { 'page-1': 1, 'page-2': 2, 'page-end': 3 };
  const title = (pageId: string | undefined) =>
    getTitleFromPageId(pageId, 'Page', fieldNumbers, fields, 'Last page');

  it('names the page by its number', () => {
    expect(title('page-2')).toBe('Page 2');
  });

  it('names the last field the last page', () => {
    expect(title('page-end')).toBe('Last page');
  });

  it('returns nothing without a page id', () => {
    expect(title(undefined)).toBeUndefined();
  });

  it('shows an undefined number for a page that is not in the form', () => {
    expect(title('deleted-page')).toBe('Page undefined');
  });
});
