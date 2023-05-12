import React from 'react';
import { screen, render, fireEvent, waitFor } from 'utils/testUtils/rtl';
import EditCustomPageSettings from './';
import { ICustomPageData } from 'services/customPages';

jest.mock('api/topics/useTopics');
jest.mock('api/areas/useAreas');

const mockCustomPage: ICustomPageData = {
  attributes: {
    top_info_section_multiloc: {},
    title_multiloc: { en: 'title' },
    nav_bar_item_title_multiloc: { en: 'user generated content' },
    slug: 'my-custom-page',
    banner_layout: 'fixed_ratio_layout',
    banner_overlay_color: '#fff',
    banner_overlay_opacity: 80,
    banner_cta_button_multiloc: {},
    // check if this can be null
    banner_cta_button_type: 'no_button',
    banner_cta_button_url: 'https://www.website.coms',
    banner_header_multiloc: {},
    banner_subheader_multiloc: {},
    bottom_info_section_multiloc: {},
    header_bg: null,

    code: 'custom',
    // not sure about these

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
    nav_bar_item: { data: [{ id: '123', type: 'nav_bar_item' }] },
    topics: { data: [] },
    areas: { data: [] },
  },
};
jest.mock('hooks/useCustomPage', () => jest.fn(() => ({})));

jest.mock('services/customPages', () => ({
  // `async` simulates the original `updateCustomPage` which is also `async`.
  // It's important for testing it properly.
  updateCustomPage: jest.fn(async () => {
    // copied from
    // https://github.com/CitizenLabDotCo/citizenlab/blob/e437c601eeb606bb5e9c46bde9a5b46c1642b65f/front/app/utils/request.ts#L57
    const error = new Error('error');
    Object.assign(error, {
      json: {
        errors: {
          slug: [{ error: 'taken', value: 'existing-slug' }],
        },
      },
    });
    throw error;
  }),
}));

describe('EditCustomPageSettings', () => {
  describe('Edit custom page', () => {
    it('renders error in case of invalid slug', async () => {
      const { container } = render(<EditCustomPageSettings />);
      fireEvent.change(screen.getByRole('textbox', { name: 'Slug' }), {
        target: {
          value: 'existing-slug',
        },
      });
      fireEvent.click(container.querySelector('button[type="submit"]'));
      await waitFor(() => {
        expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
      });
    });
  });
});
