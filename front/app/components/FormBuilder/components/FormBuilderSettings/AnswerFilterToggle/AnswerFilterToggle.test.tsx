import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import { render, screen } from 'utils/testUtils/rtl';

import AnswerFilterToggle from '.';

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

const renderToggle = ({
  input_type = 'select',
  answers_visible_to = 'public',
}: {
  input_type?: string;
  answers_visible_to?: string;
} = {}) => {
  const Wrapper = () => {
    const methods = useForm({
      defaultValues: {
        customFields: [
          { input_type, answers_visible_to, show_as_filter: false },
        ],
      },
    });

    return (
      <FormProvider {...methods}>
        <AnswerFilterToggle field={{ index: 0 } as IFlatCustomFieldWithIndex} />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

const toggle = () =>
  screen.queryByRole('checkbox', { name: /use as a filter/i });

describe('AnswerFilterToggle', () => {
  it('lets a choice question with public answers be used as a filter', () => {
    renderToggle();

    expect(toggle()).toBeInTheDocument();
  });

  it('is not offered while the answers are private', () => {
    renderToggle({ answers_visible_to: 'moderators' });

    expect(toggle()).not.toBeInTheDocument();
  });

  it('is not offered for a question without options', () => {
    renderToggle({ input_type: 'text' });

    expect(toggle()).not.toBeInTheDocument();
  });
});
