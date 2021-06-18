import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import GoBackButton from './';

jest.mock('../../../hooks/useProjectFolder', () => {
  return {
    id: 'a8735d6f-cdd4-4242-8531-b089b5e3954a',
    type: 'folder',
    attributes: {
      title_multiloc: {
        en: 'TestFolder',
        'fr-BE': 'Le folder du test',
        'nl-BE': 'TestMap',
      },
      description_preview_multiloc: {
        en: 'Bla',
        'fr-BE': 'Bla',
        'nl-BE': 'Bla',
      },
      slug: 'testfolder',
      created_at: '2021-06-17T07:34:54.208Z',
      updated_at: '2021-06-17T07:34:54.244Z',
      description_multiloc: {
        en: '<p>Bla</p>',
        'fr-BE': '<p>Bla</p>',
        'nl-BE': '<p>Bla</p>',
      },
      header_bg: {
        large: null,
        medium: null,
        small: null,
      },
      visible_projects_count: 1,
    },
    relationships: {
      admin_publication: {
        data: {
          id: '5c864c64-ee73-479e-876d-514db3196e81',
          type: 'admin_publication',
        },
      },
      images: {
        data: [],
      },
    },
  };
});

jest.mock('hooks/useLocale', () => 'en');

jest.mock('hooks/useLocalize'); // this is just a function with a `multiloc` object and a possible `maxChar` arg
// function localize(multiloc, maxChar)

describe('GoBackButton', () => {
  it('should render', () => {
    render(<GoBackButton />);
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    expect(screen.getByText(defaultTagProps.label)).toBeInTheDocument();
  });
});
