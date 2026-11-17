import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import NativeSurveyOption from './NativeSurveyOption';

let mockFields: { enabled: boolean; input_type: string }[] | undefined;

jest.mock('api/custom_fields/useCustomFields', () => () => ({
  data: mockFields,
}));

const onAddQuestions = jest.fn();

const renderOption = () =>
  render(
    <NativeSurveyOption
      projectId="project-id"
      phaseId="phase-id"
      name="survey-method"
      title="Survey"
      description="Survey description"
      onAddQuestions={onAddQuestions}
    />
  );

describe('NativeSurveyOption', () => {
  beforeEach(() => onAddQuestions.mockClear());

  it('labels a configured survey Edit survey and opens the setup', async () => {
    mockFields = [{ enabled: true, input_type: 'text' }];
    renderOption();

    await userEvent.click(screen.getByRole('button', { name: 'Edit survey' }));
    expect(onAddQuestions).toHaveBeenCalledTimes(1);
  });

  it('offers Add questions when there are no enabled questions', async () => {
    mockFields = [
      { enabled: true, input_type: 'page' },
      { enabled: false, input_type: 'text' },
    ];
    renderOption();

    expect(
      screen.queryByRole('button', { name: 'Edit survey' })
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add questions' })
    );
    expect(onAddQuestions).toHaveBeenCalledTimes(1);
  });

  it('does not offer a form action before questions have loaded', () => {
    mockFields = undefined;
    renderOption();

    expect(
      screen.queryByRole('button', { name: 'Edit survey' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add questions' })
    ).not.toBeInTheDocument();
  });
});
