import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

import { render, screen } from 'utils/testUtils/rtl';

import LogicSettings from '.';

const baseField = (
  attributes: Partial<IFlatCustomField> &
    Pick<IFlatCustomField, 'id' | 'input_type'>
): IFlatCustomField => ({
  type: 'custom_field',
  key: attributes.id,
  title_multiloc: { en: attributes.id },
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

const renderLogicSettings = (question: IFlatCustomField) => {
  const customFields = [
    baseField({ id: 'page-1', input_type: 'page' }),
    question,
    baseField({ id: 'page-2', input_type: 'page' }),
    baseField({ id: 'page-end', key: 'form_end', input_type: 'page' }),
  ];
  const field: IFlatCustomFieldWithIndex = { ...question, index: 1 };

  const Wrapper = () => {
    const methods = useForm({ defaultValues: { customFields } });

    return (
      <FormProvider {...methods}>
        <LogicSettings field={field} builderConfig={undefined} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

const select = (required: boolean) =>
  baseField({
    id: 'q',
    input_type: 'select',
    required,
    options: [
      { id: 'option-a', key: 'a', title_multiloc: { en: 'Option A' } },
      { temp_id: 'TEMP-b', title_multiloc: { en: 'Option B' } },
      { id: 'option-untitled', key: 'c', title_multiloc: { en: '' } },
    ],
  });

describe('LogicSettings answers', () => {
  it('offers a rule per titled option, any other answer and no answer for an optional select', () => {
    renderLogicSettings(select(false));

    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('If any other answer')).toBeInTheDocument();
    expect(screen.getByText('If not answered')).toBeInTheDocument();
  });

  it('does not offer a no-answer rule for a required question (current behaviour, N5)', () => {
    renderLogicSettings(select(true));

    expect(screen.getByText('If any other answer')).toBeInTheDocument();
    expect(screen.queryByText('If not answered')).not.toBeInTheDocument();
  });

  it('leaves out options without a title in the current locale', () => {
    renderLogicSettings(select(false));

    expect(screen.getAllByText('If answer is:')).toHaveLength(2);
  });

  it.each([
    { inputType: 'linear_scale', label: '' },
    { inputType: 'rating', label: ' (current behaviour, B1)' },
  ] as const)(
    'offers a rule per value from 1 to the maximum for a $inputType question$label',
    ({ inputType }) => {
      renderLogicSettings(
        baseField({ id: 'q', input_type: inputType, maximum: 3 })
      );

      ['1', '2', '3'].forEach((value) =>
        expect(screen.getByText(value)).toBeInTheDocument()
      );
      expect(screen.queryByText('4')).not.toBeInTheDocument();
      expect(screen.getByText('If any other answer')).toBeInTheDocument();
      expect(screen.getByText('If not answered')).toBeInTheDocument();
    }
  );
});
