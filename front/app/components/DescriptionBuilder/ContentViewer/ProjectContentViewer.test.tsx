import React from 'react';

import { SerializedNodes } from '@craftjs/core';

import ProjectContentViewer from 'components/DescriptionBuilder/ContentViewer/ProjectContentViewer';
import {
  defaultProjectPageLayout,
  BODY_NODE_ID,
  PHASES_NODE_ID,
  EVENTS_NODE_ID,
} from 'components/ProjectPageBuilder/defaultLayout';

import { render, screen } from 'utils/testUtils/rtl';

const projectId = 'id';
const projectTitle = {
  en: 'Project title',
};

const projectPageLayoutWithDescription = () => {
  const craftjs_json = defaultProjectPageLayout();
  craftjs_json[BODY_NODE_ID] = {
    ...craftjs_json[BODY_NODE_ID],
    nodes: ['txt', PHASES_NODE_ID, EVENTS_NODE_ID],
  };
  craftjs_json.txt = {
    type: { resolvedName: 'TextMultiloc' },
    nodes: [],
    props: { text: { en: '<p>Hello</p>' } },
    custom: {},
    hidden: false,
    parent: BODY_NODE_ID,
    isCanvas: false,
    displayName: 'TextMultiloc',
    linkedNodes: {},
  } as unknown as SerializedNodes[string];

  return {
    data: { id: 'page-layout', attributes: { enabled: true, craftjs_json } },
  };
};

const legacyLayout = {
  data: {
    id: 'legacy-layout',
    attributes: {
      enabled: true,
      craftjs_json: {
        ROOT: {
          type: 'div',
          isCanvas: true,
          props: { id: 'e2e-content-builder-frame' },
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

let mockPageLayout:
  | ReturnType<typeof projectPageLayoutWithDescription>
  | undefined;
let mockLegacyLayout: typeof legacyLayout | undefined;

jest.mock('api/project_page_layout/useProjectPageLayout', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: mockPageLayout,
    isInitialLoading: false,
  })),
}));

jest.mock('api/content_builder/useContentBuilderLayout', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: mockLegacyLayout,
    isInitialLoading: false,
  })),
}));

describe('ProjectContentViewer', () => {
  it('renders the description content of the project_page layout', () => {
    mockPageLayout = projectPageLayoutWithDescription();
    mockLegacyLayout = undefined;

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

  it('falls back to the legacy description layout for unmigrated projects', () => {
    mockPageLayout = undefined;
    mockLegacyLayout = legacyLayout;

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
  });

  it('never reads the legacy layout once a project_page layout exists, even without content', () => {
    mockPageLayout = projectPageLayoutWithDescription();
    mockPageLayout.data.attributes.craftjs_json[BODY_NODE_ID].nodes = [
      PHASES_NODE_ID,
      EVENTS_NODE_ID,
    ];
    mockLegacyLayout = legacyLayout;

    render(
      <ProjectContentViewer
        projectId={projectId}
        projectTitle={projectTitle}
        enabled={true}
      />
    );

    // The (empty) description projection renders — not the stale legacy
    // layout, not ProjectInfo.
    expect(
      screen.getByTestId('descriptionBuilderProjectPreviewContent')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('descriptionBuilderProjectDescription')
    ).not.toBeInTheDocument();
  });

  it('falls back to the plain description when the project is on neither layout', () => {
    mockPageLayout = undefined;
    mockLegacyLayout = undefined;

    render(
      <ProjectContentViewer
        projectId={projectId}
        projectTitle={projectTitle}
        enabled={false}
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
