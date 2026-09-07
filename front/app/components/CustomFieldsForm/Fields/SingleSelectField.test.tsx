import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import selectEvent from 'react-select-event';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import { LIST_LAYOUT_MAX_OPTIONS, SEARCHABLE_OPTION_COUNT } from '../constants';

import SingleSelectField from './SingleSelectField';

jest.mock('api/areas/useAreas');
jest.mock('hooks/useLocalize', () =>
  jest.fn(() => (multiloc: { en: string }) => multiloc.en)
);

const FIELD = 'estate';

const buildQuestion = (
  optionCount: number,
  overrides: Partial<IFlatCustomField> = {}
): IFlatCustomField =>
  ({
    key: FIELD,
    title_multiloc: { en: 'Which estate do you live on?' },
    input_type: 'select',
    required: false,
    dropdown_layout: true,
    options: Array.from({ length: optionCount }, (_, index) => ({
      key: `estate_${index + 1}`,
      title_multiloc: { en: `Estate ${index + 1}` },
    })),
    ...overrides,
  } as any);

let latestValues: Record<string, unknown> = {};

const renderField = (question: IFlatCustomField, defaultValue?: string) => {
  const Wrapper = () => {
    const methods = useForm({
      defaultValues: { [question.key]: defaultValue },
    });

    latestValues = methods.watch();

    return (
      <FormProvider {...methods}>
        <SingleSelectField question={question} scrollErrorIntoView={false} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

describe('SingleSelectField', () => {
  describe('dropdown layout', () => {
    // Short lists stay a plain picker so they don't open a keyboard on mobile.
    it('offers no text input below the search threshold', () => {
      renderField(buildQuestion(SEARCHABLE_OPTION_COUNT - 1));

      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-readonly',
        'true'
      );
    });

    it('filters the options by typing from the threshold on', async () => {
      const user = userEvent.setup();
      renderField(buildQuestion(SEARCHABLE_OPTION_COUNT));

      const combobox = screen.getByRole('combobox');
      expect(combobox).not.toHaveAttribute('aria-readonly');

      await user.type(combobox, 'Estate 7');

      expect(await screen.findByText('Estate 7')).toBeInTheDocument();
      expect(screen.queryByText('Estate 1')).not.toBeInTheDocument();
    });

    // Regression test: the native select silently dropped `aria-required`, so
    // required demographic questions announced as optional.
    it('announces a required question as required', () => {
      renderField(buildQuestion(3, { required: true }));

      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-required',
        'true'
      );
    });

    it('stores the option key on the form', async () => {
      renderField(buildQuestion(12));

      await selectEvent.select(screen.getByRole('combobox'), 'Estate 3');

      await waitFor(() => expect(latestValues[FIELD]).toBe('estate_3'));
    });

    // The blank first option the native select used to carry is now a clear
    // button, but the value it writes back has to stay the same.
    it('clears an optional question back to an empty value', async () => {
      renderField(buildQuestion(12), 'estate_3');

      await selectEvent.clearAll(screen.getByRole('combobox'));

      await waitFor(() => expect(latestValues[FIELD]).toBe(''));
    });
  });

  describe('long option lists', () => {
    // An admin can still have `dropdown_layout` off on a question that grew
    // past the point where a list of radios is readable.
    it('falls back to a dropdown when radios would be unreadable', () => {
      renderField(
        buildQuestion(LIST_LAYOUT_MAX_OPTIONS + 1, { dropdown_layout: false })
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
    });

    it('keeps radios at the layout threshold', () => {
      renderField(
        buildQuestion(LIST_LAYOUT_MAX_OPTIONS, { dropdown_layout: false })
      );

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(
        LIST_LAYOUT_MAX_OPTIONS
      );
    });

    it('renders only a window of a very long menu, but reports its true size', async () => {
      const optionCount = 2000;
      renderField(buildQuestion(optionCount));

      await selectEvent.openMenu(screen.getByRole('combobox'));

      const renderedOptions = await screen.findAllByRole('option');
      expect(renderedOptions.length).toBeLessThan(100);
      expect(renderedOptions[0]).toHaveAttribute(
        'aria-setsize',
        String(optionCount)
      );
      expect(renderedOptions[0]).toHaveAttribute('aria-posinset', '1');
    });
  });

  it('renders radio buttons when dropdown layout is off', () => {
    renderField(buildQuestion(3, { dropdown_layout: false }));

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });
});
