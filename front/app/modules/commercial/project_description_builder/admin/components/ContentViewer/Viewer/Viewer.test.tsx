import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import Preview from '.';

const projectId = 'id';
const projectTitle = {
  en: 'Project title',
};

jest.mock('services/locale');
jest.mock('hooks/useLocale');
jest.mock('hooks/useLocalize');

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
  'modules/commercial/project_description_builder/hooks/useProjectDescriptionBuilderLayout',
  () => {
    return jest.fn(() => mockProjectDescriptionBuilderLayoutData);
  }
);

describe('Preview', () => {
  it('should shows project description builder content when project description builder is not enabled', () => {
    render(<Preview projectId={projectId} projectTitle={projectTitle} />);
    expect(
      screen.getByTestId('contentBuilderPreviewContent')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('contentBuilderProjectDescription')
    ).not.toBeInTheDocument();
  });
  it('should shows description when project description builder is not enabled', () => {
    DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA.data.attributes.enabled =
      false;
    render(<Preview projectId={projectId} projectTitle={projectTitle} />);
    expect(
      screen.getByTestId('contentBuilderProjectDescription')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('contentBuilderPreviewContent')
    ).not.toBeInTheDocument();
  });

  it('should shows description when project description builder hook returns error', () => {
    mockProjectDescriptionBuilderLayoutData = new Error();
    render(<Preview projectId={projectId} projectTitle={projectTitle} />);
    expect(
      screen.getByTestId('contentBuilderProjectDescription')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('contentBuilderPreviewContent')
    ).not.toBeInTheDocument();
  });
  it('shows loading state correctly', () => {
    mockProjectDescriptionBuilderLayoutData = undefined;
    render(<Preview projectId={projectId} projectTitle={projectTitle} />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
