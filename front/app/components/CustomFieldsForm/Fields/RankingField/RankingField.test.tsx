import React from 'react';

import { useForm, FormProvider } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import RankingField from './index';

const question = {
  key: 'priorities',
  title_multiloc: { en: 'Rank these priorities' },
  input_type: 'ranking',
  required: false,
  options: [
    { id: '1', key: 'housing', title_multiloc: { en: 'Housing' } },
    { id: '2', key: 'mobility', title_multiloc: { en: 'Mobility' } },
  ],
} as unknown as IFlatCustomField;

const renderComponent = (defaultValues: Record<string, unknown>) => {
  const Wrapper = () => {
    const methods = useForm({ defaultValues });

    return (
      <FormProvider {...methods}>
        <RankingField question={question} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

describe('RankingField', () => {
  it('can clear a ranking that was already set when the field mounted', async () => {
    // E.g. when navigating back to an earlier survey page
    renderComponent({ [question.key]: ['mobility', 'housing'] });

    await userEvent.click(screen.getByText('Clear all'));

    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });
});
