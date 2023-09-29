import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import Preview from '.';

const projectId = 'id';
const projectTitle = {
  en: 'Project title',
};

const DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA = {
  data: {
    attributes: {
      enabled: true,
      craftjs_jsonmultiloc: { en: {} },
    },
  },
};

const mockProjectDescriptionBuilderLayoutData:
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

describe('Preview', () => {
  it('should shows project description builder content when project description builder is not enabled', () => {
    render(<Preview projectId={projectId} projectTitle={projectTitle} />);
    expect(
      screen.getByTestId('projectDescriptionBuilderPreviewContent')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('projectDescriptionBuilderProjectDescription')
    ).not.toBeInTheDocument();
  });
  it('should shows description when project description builder is not enabled', () => {
    DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA.data.attributes.enabled =
      false;
    render(<Preview projectId={projectId} projectTitle={projectTitle} />);
    expect(
      screen.getByTestId('projectDescriptionBuilderProjectDescription')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('projectDescriptionBuilderPreviewContent')
    ).not.toBeInTheDocument();
  });
});
