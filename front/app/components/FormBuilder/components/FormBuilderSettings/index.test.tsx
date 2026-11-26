import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import {
  ICustomFieldInputType,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

import { ResolvedFormBuilderConfig } from 'components/FormBuilder/utils';

import { makeCustomField } from 'utils/testUtils/customFields';
import { render, screen } from 'utils/testUtils/rtl';

import FormBuilderSettings from '.';

jest.mock('./ContentSettings', () => () => <div>Content settings</div>);
jest.mock('./LogicSettings', () => () => <div>Logic settings</div>);

const message = { id: 'test', defaultMessage: 'Test' };

const builderConfig: ResolvedFormBuilderConfig = {
  type: 'survey',
  formBuilderTitle: message,
  viewFormLinkCopy: message,
  formSavedSuccessMessage: message,
  toolboxFieldsToInclude: [],
  displayBuiltInFields: false,
  builtInFields: [],
  showStatusBadge: false,
  goBackUrl: '',
  isLogicEnabled: true,
  isParticipationPublic: false,
};

const makeField = (
  inputType: ICustomFieldInputType,
  attributes: Partial<IFlatCustomFieldWithIndex> = {}
): IFlatCustomFieldWithIndex => ({
  ...makeCustomField({
    id: 'field-1',
    key: 'field_1',
    input_type: inputType,
    title_multiloc: { en: 'Field' },
    created_at: '2025-06-01T00:00:00.000Z',
  }),
  index: 0,
  ...attributes,
});

const renderSettings = (
  field: IFlatCustomFieldWithIndex,
  config: ResolvedFormBuilderConfig = builderConfig
) => {
  const Wrapper = () => {
    const methods = useForm({ defaultValues: { customFields: [field] } });

    return (
      <FormProvider {...methods}>
        <FormBuilderSettings
          field={field}
          closeSettings={() => undefined}
          builderConfig={config}
        />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

const multiselectRules = {
  rules: [{ if: 'option-a', goto_page_id: 'page-2' }],
};

describe('FormBuilderSettings logic tab', () => {
  it.each([
    { inputType: 'select', label: '' },
    { inputType: 'linear_scale', label: '' },
    { inputType: 'rating', label: ' (current behaviour, B1)' },
    { inputType: 'page', label: '' },
  ] as const)(
    'shows the logic tab for a $inputType field$label',
    ({ inputType }) => {
      renderSettings(makeField(inputType));

      expect(screen.getByText('Logic')).toBeInTheDocument();
    }
  );

  it.each([
    'multiselect',
    'multiselect_image',
    'ranking',
    'text',
    'sentiment_linear_scale',
  ] as const)('hides the logic tab for a %s field', (inputType) => {
    renderSettings(makeField(inputType));

    expect(screen.queryByText('Logic')).not.toBeInTheDocument();
    expect(screen.getByText('Content settings')).toBeInTheDocument();
  });

  it('hides the logic tab for the end page', () => {
    renderSettings(makeField('page', { key: 'form_end' }));

    expect(screen.queryByText('Logic')).not.toBeInTheDocument();
  });

  it.each(['multiselect', 'multiselect_image'] as const)(
    'shows the logic tab for a %s field created before 2026-01-18 that has rules (current behaviour, B7)',
    (inputType) => {
      renderSettings(
        makeField(inputType, {
          created_at: '2026-01-17T23:59:59.000Z',
          logic: multiselectRules,
        })
      );

      expect(screen.getByText('Logic')).toBeInTheDocument();
    }
  );

  it('hides the logic tab for a multiselect field created on 2026-01-18 that has rules', () => {
    renderSettings(
      makeField('multiselect', {
        created_at: '2026-01-18T00:00:00.000Z',
        logic: multiselectRules,
      })
    );

    expect(screen.queryByText('Logic')).not.toBeInTheDocument();
  });

  it('hides the logic tab for an old multiselect field without rules', () => {
    renderSettings(
      makeField('multiselect', {
        created_at: '2025-01-01T00:00:00.000Z',
        logic: { rules: [] },
      })
    );

    expect(screen.queryByText('Logic')).not.toBeInTheDocument();
  });

  it('hides the logic tab when the phase does not support logic', () => {
    renderSettings(makeField('select'), {
      ...builderConfig,
      isLogicEnabled: false,
    });

    expect(screen.queryByText('Logic')).not.toBeInTheDocument();
    expect(screen.getByText('Content settings')).toBeInTheDocument();
  });

  it('opens on the logic tab when asked to', () => {
    renderSettings(makeField('select', { defaultTab: 'logic' }));

    expect(screen.getByText('Logic settings')).toBeInTheDocument();
    expect(screen.queryByText('Content settings')).not.toBeInTheDocument();
  });
});
