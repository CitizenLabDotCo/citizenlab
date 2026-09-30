import React from 'react';

import { IJobData } from 'api/jobs/types';
import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import SurveyGenerator from '.';

jest.mock('api/app_configuration/useAppConfiguration');

let mockPublicationStatus = 'draft';
jest.mock('api/projects/useProjectById', () =>
  jest.fn(() => ({
    data: {
      data: {
        ...project1,
        attributes: {
          ...project1.attributes,
          publication_status: mockPublicationStatus,
        },
      },
    },
  }))
);

const mockAddSurveyGeneration = jest.fn();
jest.mock('api/survey_generations/useAddSurveyGeneration', () =>
  jest.fn(() => ({ mutateAsync: mockAddSurveyGeneration }))
);

jest.mock('api/files/useAddFile', () =>
  jest.fn(() => ({ mutateAsync: jest.fn() }))
);

let mockJobs: IJobData[] = [];
let mockJobsUpdatedAt = 1;
jest.mock('api/survey_generations/useSurveyGenerationJob', () =>
  jest.fn(() => ({
    data: { data: mockJobs },
    isSuccess: true,
    isPlaceholderData: false,
    isLoading: false,
    dataUpdatedAt: mockJobsUpdatedAt,
  }))
);

const job = (attributes: Partial<IJobData['attributes']>): IJobData => ({
  id: 'job-1',
  type: 'job',
  attributes: {
    progress: 0,
    error_count: 0,
    total: 1,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    job_type: 'IdeaCustomFields::SurveyGenerationJob',
    errors: [],
    ...attributes,
  },
  relationships: {
    owner: { data: { id: 'user-1', type: 'user' } },
    project: { data: { id: project1.id, type: 'project' } },
    context: { data: { id: 'phase-1', type: 'phase' } },
  },
});

const phase = {
  ...phasesData[0],
  attributes: {
    ...phasesData[0].attributes,
    participation_method: 'native_survey' as const,
  },
};

describe('SurveyGenerator', () => {
  beforeEach(() => {
    mockPublicationStatus = 'draft';
    mockJobs = [];
    mockJobsUpdatedAt = 1;
    mockAddSurveyGeneration.mockReset();
  });

  it('does not offer generation when the survey has responses', () => {
    render(
      <SurveyGenerator
        phase={phase}
        totalSubmissions={3}
        onSurveyGenerated={jest.fn()}
      />
    );

    expect(
      screen.getByText(
        'This survey already has responses, so it can no longer be generated with AI.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Generate/ })).toBeNull();
  });

  it('does not offer generation when the project is published', () => {
    mockPublicationStatus = 'published';

    render(
      <SurveyGenerator
        phase={phase}
        totalSubmissions={0}
        onSurveyGenerated={jest.fn()}
      />
    );

    expect(
      screen.getByText(
        'Surveys can only be generated with AI while the project is a draft.'
      )
    ).toBeInTheDocument();
  });

  it('starts a generation once the admin confirms the replacement', async () => {
    render(
      <SurveyGenerator
        phase={phase}
        totalSubmissions={0}
        onSurveyGenerated={jest.fn()}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'A survey about the park' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Generate/ }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Replace and generate' })
    );

    await waitFor(() =>
      expect(mockAddSurveyGeneration).toHaveBeenCalledWith({
        phaseId: phase.id,
        prompt: 'A survey about the park',
        locale: 'en',
        fileIds: [],
      })
    );
    expect(
      await screen.findByText('A survey about the park')
    ).toBeInTheDocument();
  });

  it('reloads the builder when a running generation succeeds', async () => {
    const onSurveyGenerated = jest.fn();
    mockJobs = [job({})];

    const { rerender } = render(
      <SurveyGenerator
        phase={phase}
        totalSubmissions={0}
        onSurveyGenerated={onSurveyGenerated}
      />
    );

    expect(screen.getByText('Generating your survey…')).toBeInTheDocument();

    mockJobs = [job({ progress: 1, completed_at: new Date().toISOString() })];
    mockJobsUpdatedAt = 2;
    rerender(
      <SurveyGenerator
        phase={phase}
        totalSubmissions={0}
        onSurveyGenerated={onSurveyGenerated}
      />
    );

    await waitFor(() => expect(onSurveyGenerated).toHaveBeenCalledTimes(1));
  });
});
