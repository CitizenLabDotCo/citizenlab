import React from 'react';

import ProjectFullScreenPreview from 'containers/DescriptionBuilder/ProjectDescriptionBuilder/ProjectFullScreenPreview';

import { setTranslations } from 'components/admin/ContentBuilder/LanguageProvider/__mocks__/i18nLoader';

import { render, screen, waitFor } from 'utils/testUtils/rtl';

jest.mock('components/admin/ContentBuilder/LanguageProvider/i18nLoader');

let mockLocale = 'en';

jest.mock('hooks/useLocale');
jest.mock(
  'hooks/useLocalize',
  () => () => jest.fn((multiloc) => multiloc[mockLocale])
);

const DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA = {
  data: {
    attributes: {
      enabled: true,
      craftjs_json: {},
    },
  },
};

let mockProjectDescriptionBuilderLayoutData:
  | typeof DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA
  | undefined
  | Error = DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA;

jest.mock('api/content_builder/useContentBuilderLayout', () => () => {
  return {
    data: mockProjectDescriptionBuilderLayoutData,
  };
});

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useParams: () => ({
      projectId: 'id',
    }),
    useSearchParams: () => [
      {
        get: () => mockLocale,
      },
    ],
  };
});

jest.mock('api/projects/useProjectById', () => {
  return jest.fn(() => ({
    data: {
      data: {
        id: 'id',
        type: 'project',
        attributes: {
          title_multiloc: { en: 'Test Project', 'fr-FR': 'Test Projet' },
          slug: 'test',
          uses_content_builder: true,
        },
      },
    },
  }));
});

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (content) => content,
}));

const getElementById = document.getElementById.bind(document);
document.getElementById = (id, ...args) => {
  if (id === 'modal-portal') return true;
  return getElementById(id, ...args);
};

describe('Preview Content', () => {
  beforeEach(() => {
    // Reset translations to default before each test
    setTranslations({
      en: { message: 'Hello', title: 'Test Project' },
      'fr-FR': { message: 'Bonjour', title: 'Test Projet' },
    });
  });

  it('should render', async () => {
    render(<ProjectFullScreenPreview />);
    await waitFor(() => {
      expect(
        screen.getByTestId('contentBuilderEditModePreviewContent')
      ).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('should show correct title with a different locale', async () => {
    mockLocale = 'fr-FR';
    render(<ProjectFullScreenPreview />);

    await waitFor(() => {
      expect(screen.getByText('Test Projet')).toBeInTheDocument();
    });
  });

  it('shows loading state correctly', async () => {
    mockProjectDescriptionBuilderLayoutData = undefined;
    render(<ProjectFullScreenPreview />);

    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });
});
