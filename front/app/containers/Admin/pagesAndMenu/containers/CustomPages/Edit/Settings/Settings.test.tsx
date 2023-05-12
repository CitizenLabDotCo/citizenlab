import React from 'react';
import { screen, render, waitFor, userEvent } from 'utils/testUtils/rtl';
import EditCustomPageSettings from './';
import { ICustomPageData } from 'services/customPages';

jest.mock('api/topics/useTopics');
jest.mock('api/areas/useAreas');

const mockCustomPage: ICustomPageData = {
  id: 'customPageId',
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
    topics: { data: [] },
    areas: { data: [] },
  },
};
jest.mock('hooks/useCustomPage', () => jest.fn(() => mockCustomPage));

describe('EditCustomPageSettings', () => {
  describe('Edit custom page', () => {
    it('renders error in case of invalid slug', async () => {
      const user = userEvent.setup();

      render(<EditCustomPageSettings />);

      const slugInput = screen.getByLabelText('Slug');
      const submitButton = screen.getByRole('button', {
        name: 'Save custom page',
      });

      user.type(slugInput, '-');
      user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
      });
    });

    it('does not show the slug input field for FAQ page (and other "fixed" custom pages)', () => {
      // We link to this page internally (search front for /pages/faq), so editing this slug can
      // break links. The same goes for other "fixed" custom pages, such as 'proposals'.
      // See TFixedPage in customPages.ts for a definition of fixed custom pages.
      mockCustomPage.attributes.code = 'faq';

      render(<EditCustomPageSettings />);
      const slugInput = screen.queryByRole('textbox', { name: 'Slug' });

      expect(slugInput).not.toBeInTheDocument();
    });
  });
});
