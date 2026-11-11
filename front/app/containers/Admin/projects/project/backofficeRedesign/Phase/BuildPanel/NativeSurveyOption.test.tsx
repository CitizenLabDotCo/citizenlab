import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import NativeSurveyOption from './NativeSurveyOption';

let mockFields: { enabled: boolean; input_type: string }[] | undefined;

jest.mock('api/custom_fields/useCustomFields', () => () => ({
  data: mockFields,
}));

jest.mock('./SurveySetupModal', () => ({
  __esModule: true,
  default: ({ opened, onClose }: { opened: boolean; onClose: () => void }) =>
    opened ? (
      <div role="dialog" aria-label="Survey setup">
        <button onClick={onClose}>Close survey setup</button>
      </div>
    ) : null,
}));

const renderOption = () =>
  render(
    <NativeSurveyOption
      projectId="project-id"
      phaseId="phase-id"
      name="survey-method"
      title="Survey"
      description="Survey description"
    />
  );

describe('NativeSurveyOption', () => {
  it('labels a configured survey Edit survey and preserves the setup dialog', async () => {
    mockFields = [{ enabled: true, input_type: 'text' }];
    renderOption();

    await userEvent.click(screen.getByRole('button', { name: 'Edit survey' }));
    expect(
      screen.getByRole('dialog', { name: 'Survey setup' })
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Close survey setup' })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
    expect(
      screen.getByRole('dialog', { name: 'Survey setup' })
    ).toBeInTheDocument();
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
