import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import Preview from './';

const projectId = 'id';
const projectTitle = {
  en: 'Project title',
};

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

describe('Preview', () => {
  it('should shows content builder content when content builder is not enabled', () => {
    render(<Preview projectId={projectId} projectTitle={projectTitle} />);
    expect(
      screen.getByTestId('contentBuilderPreviewContent')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('contentBuilderProjectDescription')
    ).not.toBeInTheDocument();
  });
  it('should shows description when content builder is not enabled', () => {
    DEFAULT_CONTENT_BUILDER_LAYOUT_DATA.data.attributes.enabled = false;
    render(<Preview projectId={projectId} projectTitle={projectTitle} />);
    expect(
      screen.getByTestId('contentBuilderProjectDescription')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('contentBuilderPreviewContent')
    ).not.toBeInTheDocument();
  });

  it('should shows description when content builder hook returns error', () => {
    mockContentBuilderLayoutData = new Error();
    render(<Preview projectId={projectId} projectTitle={projectTitle} />);
    expect(
      screen.getByTestId('contentBuilderProjectDescription')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('contentBuilderPreviewContent')
    ).not.toBeInTheDocument();
  });
  it('shows loading state correctly', () => {
    mockContentBuilderLayoutData = undefined;
    render(<Preview projectId={projectId} projectTitle={projectTitle} />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
