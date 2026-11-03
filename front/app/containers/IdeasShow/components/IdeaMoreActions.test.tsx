import React from 'react';

import { ideaData as mockIdeaData } from 'api/ideas/__mocks__/_mockServer';
import { IIdeaData } from 'api/ideas/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import IdeaMoreActions from './IdeaMoreActions';

const mockProjectData = {
  id: '2',
  type: 'project',
  attributes: {
    title_multiloc: { en: 'Test Project' },
    slug: 'test',
  },
};

jest.mock('api/me/useAuthUser');
jest.mock('api/projects/useProjectById', () =>
  jest.fn(() => ({ data: { data: mockProjectData } }))
);
jest.mock('api/phases/usePhases', () => jest.fn(() => ({ data: undefined })));

const publicInput: IIdeaData = mockIdeaData[0];
const surveyResponse: IIdeaData = {
  ...publicInput,
  attributes: { ...publicInput.attributes, supports_public_visibility: false },
};

describe('IdeaMoreActions', () => {
  it('offers reporting as spam for a publicly visible input', async () => {
    render(<IdeaMoreActions idea={publicInput} projectId="2" />);

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Report as spam')).toBeInTheDocument();
  });

  it('renders nothing for an input that is not publicly visible', () => {
    render(<IdeaMoreActions idea={surveyResponse} projectId="2" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
