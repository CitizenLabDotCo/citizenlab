import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import SiteMap from './index';

// Mock the modules
jest.mock('api/navbar/useNavbarItems', () =>
  jest.fn(() => ({ data: { data: [] } }))
);

// Fix the localize mock to handle undefined input
jest.mock('hooks/useLocalize', () =>
  jest.fn(() => (multiloc) => {
    if (!multiloc) return '';
    return multiloc.en || Object.values(multiloc)[0] || '';
  })
);

jest.mock('api/me/useAuthUser', () => jest.fn(() => ({ data: null })));

// Mock useCustomPages - use directly in mock without reference
jest.mock('api/custom_pages/useCustomPages', () => jest.fn());

// Get the mock after it's created
const useCustomPages = jest.requireMock('api/custom_pages/useCustomPages');

describe('SiteMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows default cookie policy link when no custom cookie policy exists', () => {
    useCustomPages.mockReturnValue({
      data: {
        data: [{ id: 'page-1', attributes: { code: 'faq' } }],
      },
    });

    render(<SiteMap />);
    // Update this to match the actual text showing in the component
    const link = screen.getByText(/Cookies/i);
    expect(link.closest('a')).toHaveAttribute(
      'href',
      '/en/pages/cookie-policy'
    );
  });

  it('shows custom cookie policy link when custom cookie policy exists', () => {
    useCustomPages.mockReturnValue({
      data: {
        data: [
          {
            id: 'cookie-page',
            attributes: {
              code: 'cookie-policy',
              slug: 'cookie-policy',
              title_multiloc: { en: 'Cookies' },
            },
          },
        ],
      },
    });

    render(<SiteMap />);
    const link = screen.getByText(/Cookies/i);
    expect(link.closest('a')).toHaveAttribute(
      'href',
      '/en/pages/cookie-policy'
    );
  });
});
