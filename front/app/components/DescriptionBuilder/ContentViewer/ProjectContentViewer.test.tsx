import React from 'react';

import ProjectContentViewer from 'components/DescriptionBuilder/ContentViewer/ProjectContentViewer';

import { render, screen } from 'utils/testUtils/rtl';

const projectId = 'id';
const projectTitle = {
  en: 'Project title',
};

const DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA = {
  data: {
    attributes: {
      enabled: true,
      craftjs_json: {
        ROOT: {
          type: 'div',
          isCanvas: true,
          props: {
            id: 'e2e-content-builder-frame',
          },
          displayName: 'div',
          custom: {},
          hidden: false,
          nodes: [],
          linkedNodes: {},
        },
      },
    },
  },
};

const mockProjectDescriptionBuilderLayoutData:
  | typeof DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA
  | undefined
  | Error = DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA;

jest.mock('api/content_builder/useContentBuilderLayout', () => () => {
  return {
    data: mockProjectDescriptionBuilderLayoutData,
  };
});

const mockFeatureFlagData = true;
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

describe('Preview', () => {
  it('should shows project description builder content when project description builder is enabled', () => {
    render(
      <ProjectContentViewer
        projectId={projectId}
        projectTitle={projectTitle}
        enabled={true}
      />
    );
    expect(
      screen.getByTestId('descriptionBuilderProjectPreviewContent')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('descriptionBuilderProjectDescription')
    ).not.toBeInTheDocument();
  });

  it('should show description when project description builder is not enabled', () => {
    DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA.data.attributes.enabled =
      false;
    render(
      <ProjectContentViewer
        projectId={projectId}
        projectTitle={projectTitle}
        enabled={true}
      />
    );
    expect(
      screen.getByTestId('descriptionBuilderProjectDescription')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('descriptionBuilderProjectPreviewContent')
    ).not.toBeInTheDocument();
  });
});
