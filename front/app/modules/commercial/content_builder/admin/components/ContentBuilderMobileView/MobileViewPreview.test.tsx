import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import { MobileViewPreview } from './MobileViewPreview';

jest.mock('services/locale');
jest.mock('hooks/useLocale');
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

describe('Mobile Preview Content', () => {
  it('should shows content builder content when content builder is not enabled', () => {
    render(<MobileViewPreview />);
    expect(
      screen.getByTestId('contentBuilderMobilePreviewContent')
    ).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    mockContentBuilderLayoutData = undefined;
    render(<MobileViewPreview />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
