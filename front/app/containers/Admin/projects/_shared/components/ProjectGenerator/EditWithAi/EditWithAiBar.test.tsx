import React from 'react';

import { project1 } from 'api/projects/__mocks__/_mockServer';
import { IProjectData, PublicationStatus } from 'api/projects/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import EditWithAiBar from './EditWithAiBar';

jest.mock('components/AiAssistant/useAiAssistantEnabled', () => () => true);

jest.mock(
  '..',
  () =>
    ({ opened }: { opened: boolean }) =>
      opened ? <p>Generator opened</p> : null
);

const project = (publicationStatus: PublicationStatus): IProjectData => ({
  ...project1,
  attributes: { ...project1.attributes, publication_status: publicationStatus },
});

describe('EditWithAiBar', () => {
  it('opens the assistant on any draft, also one not started with it', async () => {
    render(<EditWithAiBar project={project('draft')} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Chat to change anything' })
    );

    expect(screen.getByText('Generator opened')).toBeInTheDocument();
  });

  it('stays hidden once the project is published', () => {
    render(<EditWithAiBar project={project('published')} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
