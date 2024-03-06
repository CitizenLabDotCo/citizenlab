import React from 'react';

import { screen, render } from 'utils/testUtils/rtl';

import ProjectDescriptionBuilderPage from '.';

const DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA = {
  data: {
    id: '2',
    type: 'content_builder_layout',
    attributes: {
      craftjs_json: {
        nodeId: {
          custom: {},
          displayName: 'div',
          hidden: false,
          isCanvas: true,
          linkedNodes: {},
          nodes: [],
          type: 'div',
          props: {},
          parent: 'ROOT',
        },
      },
      code: 'project_description',
      enabled: true,
    },
  },
};

const mockProjectDescriptionBuilderLayoutData: typeof DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA =
  DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA;

jest.mock(
  'modules/commercial/project_description_builder/api/useProjectDescriptionBuilderLayout',
  () => () => {
    return {
      data: mockProjectDescriptionBuilderLayoutData,
    };
  }
);

jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'fr-FR'])
);

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useLocation: () => ({
      pathname: 'admin/project-description-builder',
    }),
    useParams: () => ({
      projectId: 'projectId',
    }),
  };
});

const mockProjectData = {
  id: '2',
  type: 'project',
  attributes: {
    title_multiloc: { en: 'Test Project' },
    slug: 'test',
    uses_content_builder: true,
  },
};

jest.mock('api/projects/useProjectById', () =>
  jest.fn(() => ({ data: { data: mockProjectData } }))
);

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

jest.mock('@craftjs/core', () => {
  const originalModule = jest.requireActual('@craftjs/core');
  return {
    ...originalModule,
    useEditor: () => ({
      connectors: { create: jest.fn() },
      query: { serialize: jest.fn(() => '{}') },
      actions: { selectNode: jest.fn(), deserialize: jest.fn(() => {}) },
    }),
  };
});

describe('ProjectDescriptionBuilderPage', () => {
  it('should render', () => {
    render(<ProjectDescriptionBuilderPage />);
    expect(screen.getByTestId('contentBuilderPage')).toBeInTheDocument();
  });
  it('should not display error message when there is no error', () => {
    render(<ProjectDescriptionBuilderPage />);
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
});
