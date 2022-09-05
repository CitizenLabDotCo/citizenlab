import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import { EditModePreview } from './EditModePreview';

let mockLocale = 'en';
jest.mock('services/locale');
jest.mock('hooks/useLocale', () => jest.fn(() => mockLocale));
jest.mock('hooks/useLocalize');

const DEFAULT_CONTENT_BUILDER_LAYOUT_DATA = {
  data: {
    attributes: {
      enabled: true,
      craftjs_jsonmultiloc: { en: {} },
    },
  },
};

let mockContentBuilderLayoutData:
  | typeof DEFAULT_CONTENT_BUILDER_LAYOUT_DATA
  | undefined
  | Error = DEFAULT_CONTENT_BUILDER_LAYOUT_DATA;

jest.mock('modules/commercial/content_builder/hooks/useContentBuilder', () => {
  return jest.fn(() => mockContentBuilderLayoutData);
});

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useParams: () => ({
      projectId: 'id',
    }),
  };
});

jest.mock('hooks/useProject', () => {
  return jest.fn(() => ({
    id: 'id',
    type: 'project',
    attributes: {
      title_multiloc: { en: 'Test Project', 'fr-FR': 'Test Projet' },
      slug: 'test',
    },
  }));
});

describe('Preview Content', () => {
  it('should render', () => {
    render(<EditModePreview />);
    expect(
      screen.getByTestId('contentBuilderEditModePreviewContent')
    ).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should show correct title with a different locale', () => {
    mockLocale = 'fr-FR';
    render(<EditModePreview />);

    expect(screen.getByText('Test Projet')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    mockContentBuilderLayoutData = undefined;
    render(<EditModePreview />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
