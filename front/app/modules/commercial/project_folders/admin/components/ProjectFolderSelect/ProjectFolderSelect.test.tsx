import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import ProjectFolderSelect from './';

jest.mock('services/appConfiguration');
jest.mock('services/locale');
jest.mock('utils/cl-intl');
jest.mock('hooks/useLocalize');
let mockPermission = false;
jest.mock('services/permissions', () => {
  return { usePermission: () => mockPermission };
});

jest.mock('modules/commercial/project_folders/hooks', () => {
  return {
    useProjectFolders: () => {
      return {
        projectFolders: [
          { id: 'folder1', attributes: { title_multiloc: { en: 'Folder 1' } } },
          { id: 'folder2', attributes: { title_multiloc: { en: 'Folder 2' } } },
        ],
      };
    },
  };
});
const mockUser = {
  data: {
    id: 'userId',
  },
};

jest.mock('hooks/useAuthUser', () => {
  return () => mockUser;
});

describe('ProjectFolderSelect', () => {
  it('should render', () => {
    render(
      <ProjectFolderSelect
        projectAttrs={{ folder_id: 'folderId' }}
        onProjectAttributesDiffChange={jest.fn()}
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
    const { container } = render(
      <ProjectFolderSelect
        projectAttrs={{ folder_id: 'folder1' }}
        onProjectAttributesDiffChange={jest.fn()}
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
  it('should render as disabled with "yes" option selected when userCanCreateProjectInFolderOnly is true', () => {
    mockPermission = true;
    const { container } = render(
      <ProjectFolderSelect
        projectAttrs={{}}
        onProjectAttributesDiffChange={jest.fn()}
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

    expect(container.querySelector('label[for="folderSelect-no"]')).toHaveClass(
      'disabled'
    );
  });
});
