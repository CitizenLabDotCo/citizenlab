import React from 'react';

import { Editor } from '@craftjs/core';

import clHistory from 'utils/cl-router/history';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import CustomPageBuilderTopBar from '.';

jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ customPageId: 'page-1' }),
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

const defaultProps: React.ComponentProps<typeof CustomPageBuilderTopBar> = {
  previewEnabled: false,
  setPreviewEnabled: jest.fn(),
  selectedLocale: 'en',
  onSelectLocale: jest.fn(),
  backPath: '/admin/pages-menu/pages/page-1/content',
  previewLink: { to: '/pages/$slug', params: { slug: 'about-us' } },
  titleMultiloc: { en: 'About us' },
  onSave: jest.fn(() => Promise.resolve(true)),
  isSaving: false,
  saveHasError: false,
};

const renderTopBar = (
  props: Partial<React.ComponentProps<typeof CustomPageBuilderTopBar>> = {}
) =>
  render(
    <Editor>
      <CustomPageBuilderTopBar {...defaultProps} {...props} />
    </Editor>
  );

describe('CustomPageBuilderTopBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the page title', () => {
    renderTopBar();

    expect(screen.getByText('About us')).toBeInTheDocument();
  });

  it('goes back to the page when the back button is clicked', () => {
    const push = jest.spyOn(clHistory, 'push').mockImplementation(() => {});
    renderTopBar();

    fireEvent.click(screen.getByTestId('goBackButton'));

    expect(push).toHaveBeenCalledWith('/admin/pages-menu/pages/page-1/content');
  });

  it('surfaces a save error', () => {
    renderTopBar({ saveHasError: true });

    expect(
      screen.getByText('There was an error saving the custom page.')
    ).toBeInTheDocument();
  });
});
