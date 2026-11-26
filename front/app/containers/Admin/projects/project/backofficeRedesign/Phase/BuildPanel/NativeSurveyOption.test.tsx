import React from 'react';

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import RadioGroup from 'design-system/RadioGroup';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import NativeSurveyOption from './NativeSurveyOption';

let mockFields: { enabled: boolean; input_type: string }[] | undefined;

jest.mock('api/custom_fields/useCustomFields', () => () => ({
  data: mockFields,
}));

jest.mock('hooks/useLocale', () => () => 'en');

const onAddQuestions = jest.fn();

const renderOption = async () => {
  const root = createRootRoute({
    component: () => (
      <RadioGroup aria-label="Survey method" value="native_survey">
        <NativeSurveyOption
          projectId="project-id"
          phaseId="phase-id"
          title="Survey"
          description="Survey description"
          onAddQuestions={onAddQuestions}
        />
      </RadioGroup>
    ),
  });
  const surveyFormRoute = createRoute({
    getParentRoute: () => root,
    path: '/$locale/admin/projects/$projectId/phases/$phaseId/survey-form',
  });
  const router = createRouter({
    routeTree: root.addChildren([surveyFormRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();

  return render(<RouterProvider router={router} />);
};

describe('NativeSurveyOption', () => {
  beforeEach(() => onAddQuestions.mockClear());

  it('labels a configured survey Edit survey and opens the setup', async () => {
    mockFields = [{ enabled: true, input_type: 'text' }];
    await renderOption();

    expect(screen.getByRole('link', { name: 'Download form' })).toHaveAttribute(
      'href',
      '/en/admin/projects/project-id/phases/phase-id/survey-form'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit survey' }));
    expect(onAddQuestions).toHaveBeenCalledTimes(1);
  });

  it('offers Add questions when there are no enabled questions', async () => {
    mockFields = [
      { enabled: true, input_type: 'page' },
      { enabled: false, input_type: 'text' },
    ];
    await renderOption();

    expect(
      screen.queryByRole('button', { name: 'Edit survey' })
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add questions' })
    );
    expect(onAddQuestions).toHaveBeenCalledTimes(1);
  });

  it('does not offer a form action before questions have loaded', async () => {
    mockFields = undefined;
    await renderOption();

    expect(
      screen.queryByRole('button', { name: 'Edit survey' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add questions' })
    ).not.toBeInTheDocument();
  });
});
