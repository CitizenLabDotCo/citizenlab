import React from 'react';

import { Editor } from '@craftjs/core';

import { render, screen } from 'utils/testUtils/rtl';

import ProjectPageBuilderTopBar from '.';

jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ projectId: 'project-1' }),
  useLocation: jest.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    href: '/',
    state: {},
  })),
  useNavigate: jest.fn(() => jest.fn()),
  useRouterState: jest.fn(() => ({
    location: { pathname: '/', search: '', hash: '', href: '/', state: {} },
  })),
}));

const defaultProps: React.ComponentProps<typeof ProjectPageBuilderTopBar> = {
  previewEnabled: false,
  setPreviewEnabled: jest.fn(),
  selectedLocale: 'en',
  onSelectLocale: jest.fn(),
  backPath: '/admin/projects/project-1',
  previewLink: { to: '/projects/$slug', params: { slug: 'my-project' } },
  titleMultiloc: { en: 'My project' },
  onSave: jest.fn(() => Promise.resolve(true)),
  isSaving: false,
  saveError: null,
  hasError: false,
  hasPendingState: false,
};

const renderTopBar = (
  props: Partial<React.ComponentProps<typeof ProjectPageBuilderTopBar>> = {}
) =>
  render(
    <Editor>
      <ProjectPageBuilderTopBar {...defaultProps} {...props} />
    </Editor>
  );

describe('ProjectPageBuilderTopBar', () => {
  it('shows no save error by default', () => {
    renderTopBar();

    expect(
      screen.queryByText('There was an error saving the project page.')
    ).not.toBeInTheDocument();
  });

  it('surfaces a generic save error', () => {
    renderTopBar({ saveError: 'generic' });

    expect(
      screen.getByText('There was an error saving the project page.')
    ).toBeInTheDocument();
  });

  it('explains a save refused because of a file', () => {
    renderTopBar({ saveError: 'unauthorizedFile' });

    expect(
      screen.getByText(
        "The project page wasn't saved because you can't use one of the files you added. Remove it, or ask an admin to add it."
      )
    ).toBeInTheDocument();
  });
});
