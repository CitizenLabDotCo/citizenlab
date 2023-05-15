import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import clHistory from 'utils/cl-router/history';

import ProjectFolderGoBackButton from '.';

const projectFolderData = {
  id: 'a8735d6f-cdd4-4242-8531-b089b5e3954a',
  type: 'folder',
  attributes: {
    title_multiloc: {
      en: 'TestFolder',
      'fr-BE': 'Le folder du test',
      'nl-BE': 'TestMap',
    },
    slug: 'testfolder',
  },
};

jest.mock('api/project_folders/useProjectFolderById', () => {
  return jest.fn(() => ({ data: { data: projectFolderData } }));
});

describe('ProjectFolderGoBackButton', () => {
  it('should render', () => {
    render(
      <ProjectFolderGoBackButton projectFolderId={projectFolderData.id} />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('TestFolder')).toBeInTheDocument();
  });
  it('pushes parent folder path to history when clicked', () => {
    render(
      <ProjectFolderGoBackButton projectFolderId={projectFolderData.id} />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(clHistory.push).toHaveBeenCalledWith('/folders/testfolder');
  });
});
