import React from 'react';

import { render, screen, waitFor } from 'utils/testUtils/rtl';

import FullScreenPreview from '.';

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

jest.mock(
  'api/project_description_builder/useProjectDescriptionBuilderLayout',
  () => () => {
    return {
      data: mockProjectDescriptionBuilderLayoutData,
    };
  }
);

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
  it('should render', async () => {
    render(<FullScreenPreview />);
    await waitFor(() => {
      expect(
        screen.getByTestId('contentBuilderEditModePreviewContent')
      ).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('should show correct title with a different locale', async () => {
    mockLocale = 'fr-FR';
    render(<FullScreenPreview />);

    await waitFor(() => {
      expect(screen.getByText('Test Projet')).toBeInTheDocument();
    });
  });

  it('shows loading state correctly', async () => {
    mockProjectDescriptionBuilderLayoutData = undefined;
    render(<FullScreenPreview />);

    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });
});
