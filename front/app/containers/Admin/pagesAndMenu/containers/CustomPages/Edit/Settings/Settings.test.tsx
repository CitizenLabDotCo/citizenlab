import React from 'react';

import { ICustomPageData } from 'api/custom_pages/types';

import { screen, render, waitFor, userEvent } from 'utils/testUtils/rtl';

import EditCustomPageSettings from './';

jest.mock('api/global_topics/useGlobalTopics');
jest.mock('api/areas/useAreas');

const mockCustomPage: ICustomPageData = {
  id: 'customPageId',
  type: 'static_page',
  attributes: {
    top_info_section_multiloc: {},
    title_multiloc: { en: 'title' },
    nav_bar_item_title_multiloc: { en: 'user generated content' },
    slug: 'my-custom-page',
    banner_layout: 'fixed_ratio_layout',
    banner_overlay_color: '#fff',
    banner_overlay_opacity: 80,
    banner_cta_button_multiloc: {},
    banner_cta_button_type: 'no_button',
    banner_cta_button_url: 'https://www.website.coms',
    banner_header_multiloc: {},
    banner_subheader_multiloc: {},
    bottom_info_section_multiloc: {},
    header_bg: null,
    code: 'custom',
    projects_filter_type: 'no_filter',
    created_at: 'date',
    updated_at: 'date',
    banner_enabled: true,
    bottom_info_section_enabled: true,
    top_info_section_enabled: true,
    events_widget_enabled: true,
    files_section_enabled: true,
    projects_enabled: true,
  },
  relationships: {
    nav_bar_item: { data: { id: '123', type: 'nav_bar_item' } },
    global_topics: { data: [] },
    areas: { data: [] },
  },
};
jest.mock('api/custom_pages/useCustomPageById', () =>
  jest.fn(() => ({ data: { data: mockCustomPage } }))
);

describe('EditCustomPageSettings', () => {
  it('renders error in case of invalid slug', async () => {
    const user = userEvent.setup();

    render(<EditCustomPageSettings />);

    const slugInput = screen.getByLabelText('Slug');
    const submitButton = screen.getByRole('button', {
      name: 'Save custom page',
    });

    await user.type(slugInput, '-');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
    });
  });

  describe('Slug input', () => {
    it('does show the slug input field for "regular" custom pages', () => {
      // mockCustomPage.attributes.code is 'custom' by default in this test file
      render(<EditCustomPageSettings />);
      const slugInput = screen.queryByRole('textbox', { name: 'Slug' });

      expect(slugInput).toBeInTheDocument();
    });

    it('does not show the slug input field for FAQ page (and other "fixed" custom pages)', () => {
      // We link to this page internally (search front for /pages/faq), so editing this slug can
      // break links. The same goes for other "fixed" custom pages, such as 'proposals'.
      mockCustomPage.attributes.code = 'faq';

      render(<EditCustomPageSettings />);
      const slugInput = screen.queryByRole('textbox', { name: 'Slug' });

      expect(slugInput).not.toBeInTheDocument();
    });
  });
});
