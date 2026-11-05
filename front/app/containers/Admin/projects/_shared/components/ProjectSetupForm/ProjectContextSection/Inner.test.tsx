import React from 'react';

import { HighestRole, IUser } from 'api/users/types';

import { TRole } from 'utils/permissions/roles';
import { render, screen, userEvent } from 'utils/testUtils/rtl';

import Inner from './Inner';
import { Props } from './types';

jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

let mockSpacesEnabled = true;
jest.mock('hooks/useFeatureFlag', () => () => mockSpacesEnabled);

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const buildUser = (highest_role: HighestRole, roles: TRole[]): IUser => ({
  data: {
    id: 'user-1',
    type: 'user',
    attributes: {
      locale: 'en',
      bio_multiloc: {},
      registration_completed_at: '',
      created_at: '',
      updated_at: '',
      unread_notifications: 0,
      invite_status: null,
      confirmation_required: false,
      followings_count: 0,
      highest_role,
      roles,
    },
  },
});

const admin = () => buildUser('admin', [{ type: 'admin' }]);
const folderManager = () =>
  buildUser('project_folder_moderator', [
    {
      type: 'project_folder_moderator',
      project_folder_id: 'folder-in-space-1',
    },
  ]);

// The list endpoint only ever returns what the user is allowed to manage, so
// tests hand it exactly the folders that user would receive.
let mockFolders: {
  id: string;
  attributes: {
    title_multiloc: { en: string };
    space_id: string | null;
    space_title_multiloc: { en: string } | null;
  };
}[] = [];

const folderInSpace1 = {
  id: 'folder-in-space-1',
  attributes: {
    title_multiloc: { en: 'Bike lanes' },
    space_id: 'space-1',
    space_title_multiloc: { en: 'Mobility' },
  },
};
const folderInSpace2 = {
  id: 'folder-in-space-2',
  attributes: {
    title_multiloc: { en: 'Rentals' },
    space_id: 'space-2',
    space_title_multiloc: { en: 'Housing' },
  },
};
const folderWithoutSpace = {
  id: 'folder-without-space',
  attributes: {
    title_multiloc: { en: 'Climate' },
    space_id: null,
    space_title_multiloc: null,
  },
};

jest.mock('api/spaces/useSpaces', () => () => ({
  data: {
    data: [
      { id: 'space-1', attributes: { title_multiloc: { en: 'Mobility' } } },
      { id: 'space-2', attributes: { title_multiloc: { en: 'Housing' } } },
    ],
  },
}));
jest.mock(
  'api/project_folders_mini/useInfiniteProjectFoldersAdmin',
  () => () => ({ data: { pages: [{ data: mockFolders }] } })
);

// Highlighter reads the location, and the test renderer has no router.
jest.mock(
  'components/Highlighter',
  () =>
    ({ children }: { children: React.ReactNode }) =>
      children
);

const onChange = jest.fn();

const renderInner = (props: Partial<Props>) =>
  render(
    <Inner
      spaceId={null}
      folderId={null}
      projectInRoot
      error={false}
      onChange={onChange}
      {...props}
    />
  );

// The space label also holds a tooltip button, so narrow it down to the select.
const spaceSelect = () =>
  screen.getByLabelText('Space', { selector: 'select' });
const folderSelect = () =>
  screen.getByLabelText('Folder', { selector: 'select' });

describe('ProjectContextSection Inner', () => {
  beforeEach(() => {
    onChange.mockClear();
    mockSpacesEnabled = true;
    mockAuthUser = admin();
    mockFolders = [folderInSpace1, folderInSpace2, folderWithoutSpace];
  });

  it('names the space of each folder while no space is selected', () => {
    renderInner({});

    expect(
      screen.getByRole('option', { name: 'Bike lanes (Mobility)' })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Climate' })).toBeInTheDocument();
  });

  it('selects the space of the folder when the folder is picked first', async () => {
    renderInner({});

    await userEvent.selectOptions(folderSelect(), 'folder-in-space-2');

    expect(onChange).toHaveBeenCalledWith({
      space_id: 'space-2',
      folder_id: 'folder-in-space-2',
    });
  });

  it('only offers the folders of the selected space', () => {
    renderInner({ spaceId: 'space-1' });

    expect(
      screen.getByRole('option', { name: 'Bike lanes' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Rentals' })).toBeNull();
    expect(screen.queryByRole('option', { name: 'Climate' })).toBeNull();
  });

  it('clears the folder when a space it is not in is selected', async () => {
    renderInner({ spaceId: 'space-1', folderId: 'folder-in-space-1' });

    await userEvent.selectOptions(spaceSelect(), 'space-2');

    expect(onChange).toHaveBeenCalledWith({
      space_id: 'space-2',
      folder_id: null,
    });
  });

  it('keeps the space when the folder is cleared', async () => {
    renderInner({ spaceId: 'space-1', folderId: 'folder-in-space-1' });

    await userEvent.selectOptions(folderSelect(), '/');

    expect(onChange).toHaveBeenCalledWith({
      space_id: 'space-1',
      folder_id: null,
    });
  });

  describe('the validation error', () => {
    it('says where the manager can still move the project', () => {
      renderInner({ error: true });

      expect(
        screen.getByText(/to another space or folder you manage/)
      ).toBeInTheDocument();
    });

    it('only mentions folders when there is no space select', () => {
      mockAuthUser = folderManager();

      renderInner({ error: true });

      expect(
        screen.getByText(/to another folder you manage/)
      ).toBeInTheDocument();
    });

    it('says nothing until the form is submitted', () => {
      renderInner({ spaceId: null, folderId: null, projectInRoot: false });

      expect(screen.queryByText(/you can only move this project/i)).toBeNull();
    });
  });

  describe('for a folder manager', () => {
    beforeEach(() => {
      mockAuthUser = folderManager();
      mockFolders = [folderInSpace1];
    });

    it('hides the space select and does not name spaces in the folder list', () => {
      renderInner({});

      expect(screen.queryByLabelText('Space')).toBeNull();
      expect(
        screen.getByRole('option', { name: 'Bike lanes' })
      ).toBeInTheDocument();
    });

    it('clears the space along with the folder', async () => {
      renderInner({ spaceId: 'space-1', folderId: 'folder-in-space-1' });

      await userEvent.selectOptions(folderSelect(), '/');

      expect(onChange).toHaveBeenCalledWith({
        space_id: null,
        folder_id: null,
      });
    });
  });

  describe('when the spaces feature is off', () => {
    beforeEach(() => {
      mockSpacesEnabled = false;
    });

    it('hides the space select for admins too', () => {
      renderInner({});

      expect(screen.queryByLabelText('Space')).toBeNull();
      expect(folderSelect()).toBeInTheDocument();
    });
  });
});
