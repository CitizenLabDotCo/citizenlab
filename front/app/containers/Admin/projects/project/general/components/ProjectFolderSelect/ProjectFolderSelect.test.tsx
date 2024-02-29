import React from 'react';
import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import ProjectFolderSelect from './';

let mockPermission = false;
jest.mock('utils/permissions', () => {
  return { usePermission: () => mockPermission };
});

const projectFolders = {
  data: [
    { id: 'folder1', attributes: { title_multiloc: { en: 'Folder 1' } } },
    { id: 'folder2', attributes: { title_multiloc: { en: 'Folder 2' } } },
  ],
};

jest.mock('api/project_folders/useProjectFolders', () => () => {
  return { data: projectFolders };
});

jest.mock('api/me/useAuthUser');

describe('ProjectFolderSelect', () => {
  it('should render', () => {
    render(
      <ProjectFolderSelect
        projectAttrs={{ folder_id: 'folderId' }}
        onProjectAttributesDiffChange={jest.fn()}
        isNewProject={true}
      />
    );
    expect(screen.getByTestId('projectFolderSelect')).toBeInTheDocument();
  });
  it('should render as enabled with "no" option selected when userCanCreateProjectInFolderOnly is false', () => {
    mockPermission = false;
    const { container } = render(
      <ProjectFolderSelect
        projectAttrs={{}}
        onProjectAttributesDiffChange={jest.fn()}
        isNewProject={true}
      />
    );
    expect(container.querySelector('#folderSelect-no')).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(container.querySelector('#folderSelect-no')).not.toHaveAttribute(
      'disabled'
    );
  });
  it('should render as enabled with "yes" option selected when folder id is provided', () => {
    mockPermission = true;
    const { container } = render(
      <ProjectFolderSelect
        projectAttrs={{ folder_id: 'folder1' }}
        onProjectAttributesDiffChange={jest.fn()}
        isNewProject={true}
      />
    );
    expect(container.querySelector('#folderSelect-no')).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(container.querySelector('#folderSelect-yes')).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(
      container.querySelector('label[for="folderSelect-no"]')
    ).not.toHaveClass('disabled');
  });
  it('should set folder_id to null when "no" option is selected', () => {
    mockPermission = true;
    const onProjectAttributesDiffChange = jest.fn();
    const { container } = render(
      <ProjectFolderSelect
        projectAttrs={{ folder_id: 'folder1' }}
        onProjectAttributesDiffChange={onProjectAttributesDiffChange}
        isNewProject={true}
      />
    );

    fireEvent.click(container.querySelector('#folderSelect-no'));
    expect(onProjectAttributesDiffChange).toHaveBeenCalledWith(
      { folder_id: null },
      'enabled'
    );
  });
});
