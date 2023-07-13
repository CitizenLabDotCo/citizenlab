import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import FullScreenPreview from '.';

let mockLocale = 'en';

jest.mock('hooks/useLocale', () => jest.fn(() => mockLocale));

const DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA = {
  data: {
    attributes: {
      enabled: true,
      craftjs_jsonmultiloc: { en: {} },
    },
  },
};

let mockProjectDescriptionBuilderLayoutData:
  | typeof DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA
  | undefined
  | Error = DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA;

jest.mock(
  'modules/commercial/project_description_builder/api/useProjectDescriptionBuilderLayout',
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
  it('should render', () => {
    render(<FullScreenPreview />);
    expect(
      screen.getByTestId('contentBuilderEditModePreviewContent')
    ).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should show correct title with a different locale', () => {
    mockLocale = 'fr-FR';
    render(<FullScreenPreview />);

    expect(screen.getByText('Test Projet')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    mockProjectDescriptionBuilderLayoutData = undefined;
    render(<FullScreenPreview />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
