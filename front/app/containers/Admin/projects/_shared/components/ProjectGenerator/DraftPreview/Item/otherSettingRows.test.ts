import { Multiloc } from 'typings';

import { MessageDescriptor } from 'utils/cl-intl';

import { getOtherSettingRows } from './otherSettingRows';

const format = {
  formatMessage: (
    { defaultMessage }: MessageDescriptor,
    values?: Record<string, number>
  ) => (values ? `${values.days} days` : String(defaultMessage)),
  localize: (multiloc: Multiloc) => multiloc.en ?? '',
};

const rows = (proposed: object, saved?: object, shownKeys: string[] = []) =>
  getOtherSettingRows({ proposed, saved }, shownKeys, format);

describe('getOtherSettingRows', () => {
  it('compares a proposed value with the saved one', () => {
    expect(rows({ input_term: 'petition' }, { input_term: 'idea' })).toEqual([
      {
        key: 'input_term',
        label: 'Input term',
        value: 'petition',
        previous: 'idea',
      },
    ]);
  });

  it('has nothing to compare for something new', () => {
    expect(rows({ maximum_attendees: 20 })[0]).toMatchObject({
      value: '20',
      previous: undefined,
    });
  });

  it('leaves out what has a row of its own', () => {
    expect(
      rows({ title_multiloc: { en: 'Title' } }, {}, ['title_multiloc'])
    ).toEqual([]);
  });

  it('leaves out what stays the same', () => {
    const views = ['card', 'map'];

    expect(
      rows({ available_views: views }, { available_views: [...views] })
    ).toEqual([]);
    expect(
      rows(
        { attend_button_multiloc: { fr: 'Venir' } },
        { attend_button_multiloc: { en: 'Join', fr: 'Venir' } }
      )
    ).toEqual([]);
  });

  it('merges translated texts per locale', () => {
    expect(
      rows(
        { attend_button_multiloc: { en: 'Save my spot' } },
        { attend_button_multiloc: { en: 'Join', fr: 'Venir' } }
      )[0]
    ).toMatchObject({ value: 'Save my spot', previous: 'Join' });
  });

  it('writes yes or no and empty values in words', () => {
    expect(
      rows({ require_verification: true }, { require_verification: false })[0]
    ).toMatchObject({ value: 'On', previous: 'Off' });
    expect(
      rows({ maximum_attendees: 20 }, { maximum_attendees: null })[0]
    ).toMatchObject({ value: '20', previous: 'None' });
  });

  it('says what an expiry means', () => {
    const value = (verification_expiry: number | null) =>
      rows({ verification_expiry })[0].value;

    expect(value(0)).toBe('30 minutes');
    expect(value(7)).toBe('7 days');
    expect(value(null)).toBe('Never');
  });

  it('names fixed values, also in a list', () => {
    expect(rows({ ideas_order: '-new' })[0].value).toBe('Oldest');
    expect(rows({ available_views: ['card', 'map'] })[0].value).toBe(
      'Cards, Map'
    );
  });

  it('shows a field nobody labelled yet', () => {
    expect(rows({ some_new_field: true })[0]).toMatchObject({
      label: 'Some new field',
      value: 'On',
    });
  });
});
