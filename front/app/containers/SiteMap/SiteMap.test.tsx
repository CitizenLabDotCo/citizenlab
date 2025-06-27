import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import SiteMap from './index';

jest.mock('api/navbar/useNavbarItems', () =>
  jest.fn(() => ({ data: { data: [] } }))
);
jest.mock('hooks/useLocalize', () =>
  jest.fn(
    () => (multiloc) =>
      multiloc?.en || (multiloc && Object.values(multiloc)[0]) || ''
  )
);
jest.mock('api/custom_pages/useCustomPages', () => jest.fn());

// Get the useCustomPages mock after it's created
const useCustomPages = jest.requireMock('api/custom_pages/useCustomPages');

describe('SiteMap', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows default cookie policy link when no custom cookie policy exists', () => {
    useCustomPages.mockReturnValue({
      data: { data: [{ id: 'page-1', attributes: { code: 'faq' } }] },
    });

    render(<SiteMap />);
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
