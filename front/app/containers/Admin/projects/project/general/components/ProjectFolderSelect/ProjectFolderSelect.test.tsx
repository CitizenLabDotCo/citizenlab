import React from 'react';

import { makeUser } from 'api/users/__mocks__/useUsers';

import { render, screen, within } from 'utils/testUtils/rtl';

import ProjectFolderSelect from './';

const projectFolders = {
  data: [
    { id: 'folder1', attributes: { title_multiloc: { en: 'Folder 1' } } },
    { id: 'folder2', attributes: { title_multiloc: { en: 'Folder 2' } } },
  ],
};

jest.mock('api/project_folders/useProjectFolders', () => () => {
  return { data: projectFolders };
});

const mockUserData = makeUser({
  roles: [{ type: 'admin' }],
  highest_role: 'admin',
});

jest.mock('api/me/useAuthUser', () => () => ({ data: mockUserData }));

describe('ProjectFolderSelect', () => {
  it('renders successfully', () => {
    render(
      <ProjectFolderSelect
        projectAttrs={{ folder_id: 'folderId' }}
        onProjectAttributesDiffChange={jest.fn()}
        isNewProject={true}
      />
    );

    expect(screen.getByTestId('projectFolderSelect')).toBeInTheDocument();
  });

  it('defaults to "No folder" when no folder ID is provided', () => {
    render(
      <ProjectFolderSelect
        projectAttrs={{}}
        onProjectAttributesDiffChange={jest.fn()}
        isNewProject={true}
      />
    );

    const folderSelect = screen.getByTestId('projectFolderSelect');
    const option: HTMLOptionElement = within(folderSelect).getByRole('option', {
      name: '— No folder —',
    });

    expect(option.selected).toBe(true);
    expect(option.value).toBe('/');
  });

  it('has the correct folder selected when a folder ID is provided', () => {
    render(
      <ProjectFolderSelect
        projectAttrs={{ folder_id: 'folder1' }}
        onProjectAttributesDiffChange={jest.fn()}
        isNewProject={false}
      />
    );

    const folderSelect = screen.getByTestId('projectFolderSelect');
    const selectedOption = within(folderSelect).getByRole('option', {
      selected: true,
    }) as HTMLOptionElement;

    expect(selectedOption).toBeInTheDocument();
    expect(selectedOption.value).toBe('folder1');
  });

  describe('when user is an admin', () => {
    it('has folder selection enabled for existing projects', () => {
      render(
        <ProjectFolderSelect
          projectAttrs={{}}
          onProjectAttributesDiffChange={jest.fn()}
          isNewProject={false}
        />
      );

      const folderSelect = screen.getByTestId('projectFolderSelect');
      const selectElement = within(folderSelect).getByRole('combobox');
      expect(selectElement).toBeEnabled();
    });

    it('displays all available folders', () => {
      render(
        <ProjectFolderSelect
          projectAttrs={{}}
          onProjectAttributesDiffChange={jest.fn()}
          isNewProject={true}
        />
      );

      const folderSelect = screen.getByTestId('projectFolderSelect');
      const visibleOptions = within(folderSelect)
        .getAllByRole('option')
        .filter((option) => !option.hidden);

      expect(visibleOptions.length).toBe(3);

      const labels = visibleOptions.map((option) => option.textContent);
      const expectedLabels = ['— No folder —', 'Folder 1', 'Folder 2'];
      expect(labels).toEqual(expectedLabels);
    });
  });

  describe('when user is a folder moderator', () => {
    beforeEach(() => {
      mockUserData.data.attributes.roles = [
        {
          type: 'project_folder_moderator',
          project_folder_id: 'folder1',
        },
      ];
    });

    it('has folder selection enabled for new projects', () => {
      render(
        <ProjectFolderSelect
          projectAttrs={{}}
          onProjectAttributesDiffChange={jest.fn()}
          isNewProject={true}
        />
      );

      const folderSelect = screen.getByTestId('projectFolderSelect');
      const selectElement = within(folderSelect).getByRole('combobox');
      expect(selectElement).toBeEnabled();
    });

    it('has folder selection disabled for existing projects', () => {
      render(
        <ProjectFolderSelect
          projectAttrs={{}}
          onProjectAttributesDiffChange={jest.fn()}
          isNewProject={false}
        />
      );

      const folderSelect = screen.getByTestId('projectFolderSelect');
      const selectElement = within(folderSelect).getByRole('combobox');
      expect(selectElement).toBeDisabled();
    });

    it('displays only the folders that the user moderates', () => {
      render(
        <ProjectFolderSelect
          projectAttrs={{}}
          onProjectAttributesDiffChange={jest.fn()}
          isNewProject={true}
        />
      );

      const folderSelect = screen.getByTestId('projectFolderSelect');
      const visibleOptions = within(folderSelect)
        .getAllByRole('option')
        .filter((option) => !option.hidden);

      expect(visibleOptions.length).toBe(2);

      const labels = visibleOptions.map((option) => option.textContent);
      const expectedLabels = ['— No folder —', 'Folder 1'];
      expect(labels).toEqual(expectedLabels);
    });
  });
});
