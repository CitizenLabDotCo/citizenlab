import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import ProjectViewer from './ProjectViewer';

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

const mockProjectData = {
  id: '2',
  type: 'project',
  attributes: {
    title_multiloc: { en: 'Test Project' },
    slug: 'test',
    input_term: 'idea',
    uses_content_builder: true,
  },
  relationships: {
    avatars: {
      data: [
        {
          id: '1',
          type: 'avatar',
        },
        {
          id: '2',
          type: 'avatar',
        },
      ],
    },
  },
};

const mockProjectDescriptionBuilderLayoutData:
  | typeof DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA
  | undefined
  | Error = DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA;

jest.mock(
  'api/project_description_builder/useDescriptionBuilderLayout',
  () => () => {
    return {
      data: mockProjectDescriptionBuilderLayoutData,
    };
  }
);

jest.mock('api/projects/useProjectById', () =>
  jest.fn(() => ({ data: { data: mockProjectData } }))
);

describe('Preview', () => {
  it('should shows project description builder content when project description builder is enabled', () => {
    render(<ProjectViewer projectId={projectId} projectTitle={projectTitle} />);
    expect(
      screen.getByTestId('projectDescriptionBuilderPreviewContent')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('projectDescriptionBuilderProjectDescription')
    ).not.toBeInTheDocument();
  });
  it('should show description when project description builder is not enabled', () => {
    DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA.data.attributes.enabled =
      false;
    render(<ProjectViewer projectId={projectId} projectTitle={projectTitle} />);
    expect(
      screen.getByTestId('projectDescriptionBuilderProjectDescription')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('projectDescriptionBuilderPreviewContent')
    ).not.toBeInTheDocument();
  });
});
