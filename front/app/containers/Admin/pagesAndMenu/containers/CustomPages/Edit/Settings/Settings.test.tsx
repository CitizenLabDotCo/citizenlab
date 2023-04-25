import React from 'react';
import { screen, render, fireEvent, waitFor } from 'utils/testUtils/rtl';
import EditCustomPageSettings from './';

jest.mock('hooks/useAreas', () => jest.fn(() => []));
jest.mock('api/topics/useTopics');

jest.mock('hooks/useCustomPage', () =>
  jest.fn(() => ({
    relationships: {
      nav_bar_item: { data: { id: '123' } },
      topics: { data: [] },
      areas: { data: [] },
    },
    attributes: {
      title_multiloc: { en: 'title' },
      nav_bar_item_title_multiloc: { en: 'user generated content' },
      slug: 'my-custom-page',
    },
  }))
);

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
