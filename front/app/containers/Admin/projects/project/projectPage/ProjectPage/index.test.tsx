import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import ProjectPage from '.';

let mockSearch: { groups_failed?: string } = {};
const mockGroupTitles: Record<string, string> = {
  'group-1': 'Group A',
  'group-2': 'Group B',
  'group-3': 'Group C',
};
let mockLoadedGroupIds = Object.keys(mockGroupTitles);

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useParams: () => ({ projectId: 'project-1' }),
  useSearch: () => mockSearch,
}));

jest.mock('utils/cl-router/removeSearchParams', () => ({
  removeSearchParams: jest.fn(),
}));

jest.mock('api/projects/useProjectById', () => () => ({
  data: { data: { attributes: { slug: 'my-project' } } },
}));

jest.mock(
  'api/groups/useGroupsByIds',
  () => (groupIds: string[]) =>
    groupIds.map((id) =>
      mockLoadedGroupIds.includes(id)
        ? {
            data: {
              id,
              attributes: { title_multiloc: { en: mockGroupTitles[id] } },
            },
          }
        : undefined
    )
);

jest.mock('api/app_configuration/useAppConfiguration');
jest.mock('hooks/useProjectBackofficeRedesign', () => () => false);
jest.mock('components/admin/PagePreview', () => () => null);

const NOT_ADDED = /These groups couldn't be added/;

beforeEach(() => {
  mockSearch = {};
  mockLoadedGroupIds = Object.keys(mockGroupTitles);
  const portal = document.createElement('div');
  portal.id = 'modal-portal';
  document.body.appendChild(portal);
});

afterEach(() => {
  document.getElementById('modal-portal')?.remove();
});

describe('ProjectPage', () => {
  it('names only the groups that could not be added', async () => {
    mockSearch = { groups_failed: 'group-2,group-3' };

    render(<ProjectPage />);

    expect(
      await screen.findByText(
        "Project created. These groups couldn't be added, so please add them again: Group B and Group C."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/Group A/)).not.toBeInTheDocument();
  });

  it('shows no message when every group was added', () => {
    render(<ProjectPage />);

    expect(screen.queryByText(NOT_ADDED)).not.toBeInTheDocument();
  });

  it('waits for the group names before showing the message', () => {
    mockSearch = { groups_failed: 'group-2' };
    mockLoadedGroupIds = [];

    render(<ProjectPage />);

    expect(screen.queryByText(NOT_ADDED)).not.toBeInTheDocument();
  });

  it('closes the message on OK', async () => {
    mockSearch = { groups_failed: 'group-2' };

    render(<ProjectPage />);
    await screen.findByText(NOT_ADDED);
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.queryByText(NOT_ADDED)).not.toBeInTheDocument();
  });
});
