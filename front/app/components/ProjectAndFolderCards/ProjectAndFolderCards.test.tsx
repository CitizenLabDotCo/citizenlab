import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import { getTheme } from '@citizenlab/cl2-component-library';
import * as styledComponents from 'styled-components';

import ProjectAndFolderCards from '.';

// Mock external libraries
let mockSmallerThanMinTablet = false;

jest.mock('@citizenlab/cl2-component-library', () => ({
  ...jest.requireActual('@citizenlab/cl2-component-library'),
  useWindowSize: jest.fn(() => ({ windowWidth: 1000, windowHeight: 800 })),
  useBreakpoint: jest.fn(() => mockSmallerThanMinTablet),
}));

jest.spyOn(styledComponents, 'useTheme').mockReturnValue(getTheme());

// Mock hooks
const DEFAULT_ADMIN_PUBLICATIONS = [
  { publicationId: '1', publicationType: 'project' },
  { publicationId: '2', publicationType: 'project' },
  { publicationId: '3', publicationType: 'project' },
  { publicationId: '4', publicationType: 'project' },
  { publicationId: '5', publicationType: 'project' },
];

let mockAdminPublications = DEFAULT_ADMIN_PUBLICATIONS;

let mockHasMore = false;
let mockLoadingInitial = true;
const mockLoadingMore = false;
const mockLoadMore = jest.fn();
const mockChangeTopics = jest.fn();
const mockChangeAreas = jest.fn();
const mockChangePublicationStatus = jest.fn();

jest.mock('hooks/useAdminPublications', () =>
  jest.fn(() => ({
    list: mockAdminPublications,
    hasMore: mockHasMore,
    loadingInitial: mockLoadingInitial,
    loadingMore: mockLoadingMore,
    onLoadMore: mockLoadMore,
    onChangeTopics: mockChangeTopics,
    onChangeAreas: mockChangeAreas,
    onChangePublicationStatus: mockChangePublicationStatus,
  }))
);

const DEFAULT_STATUS_COUNTS = {
  published: 3,
  archived: 2,
  all: 5,
};

let mockStatusCounts: any = DEFAULT_STATUS_COUNTS;

const mockChangeTopics2 = jest.fn();
const mockChangeAreas2 = jest.fn();
const mockChangePublicationStatus2 = jest.fn();

jest.mock('hooks/useAdminPublicationsStatusCounts', () =>
  jest.fn(() => ({
    counts: mockStatusCounts,
    onChangeTopics: mockChangeTopics2,
    onChangeAreas: mockChangeAreas2,
    onChangePublicationStatus: mockChangePublicationStatus2,
  }))
);

jest.mock('api/app_configuration/useAppConfiguration', () =>
  jest.fn(() => ({
    data: {
      data: {
        attributes: {
          settings: {
            core: {
              currently_working_on_text: { en: 'Working on text' },
              area_term: { en: 'Area' },
              topic_term: { en: 'Topic' },
            },
          },
        },
      },
    },
  }))
);

const DEFAULT_AREA_DATA = [
  {
    id: '1',
    attributes: { title_multiloc: { en: 'Area 1' } },
  },
  {
    id: '2',
    attributes: { title_multiloc: { en: 'Area 2' } },
  },
  {
    id: '3',
    attributes: { title_multiloc: { en: 'Area 3' } },
  },
];

let mockAreaData = DEFAULT_AREA_DATA;

jest.mock('hooks/useAreas', () => jest.fn(() => mockAreaData));

const DEFAULT_TOPIC_DATA = [
  { id: '1', attributes: { title_multiloc: { en: 'Topic 1' } } },
  { id: '2', attributes: { title_multiloc: { en: 'Topic 2' } } },
];

let mockTopicData = DEFAULT_TOPIC_DATA;

jest.mock('api/topics/useTopics', () =>
  jest.fn(() => {
    return { data: { data: mockTopicData } };
  })
);

// Mock components
jest.mock('components/ProjectCard', () => ({
  __esModule: true,
  default: () => <></>,
}));
jest.mock('components/Outlet', () => ({
  __esModule: true,
  default: () => <></>,
}));

jest.mock('components/T', () => ({
  __esModule: true,
  default: () => <></>,
}));

describe('<ProjectAndFolderCards />', () => {
  it('renders', () => {
    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    expect(
      container.querySelector('#e2e-projects-container')
    ).toBeInTheDocument();
  });

  it('renders LoadingBox but not ProjectsList and Footer if loadingInitial', () => {
    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    expect(screen.getByTestId('loading-box')).toBeInTheDocument();
    expect(
      container.querySelector('.e2e-projects-list')
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('.e2e-project-cards-show-more-button')
    ).not.toBeInTheDocument();
  });

  it('renders ProjectList but not LoadingBox if !loadingInitial', () => {
    mockLoadingInitial = false;

    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    expect(screen.queryByTestId('loading-box')).not.toBeInTheDocument();
    expect(container.querySelector('.e2e-projects-list')).toBeInTheDocument();
  });

  it('renders title if showTitle', () => {
    render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    expect(screen.getByTestId('currently-working-on-text')).toBeInTheDocument();
  });

  it('does not render title if !showTitle', () => {
    render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={false}
        layout={'dynamic'}
      />
    );

    expect(
      screen.queryByTestId('currently-working-on-text')
    ).not.toBeInTheDocument();
  });

  it('does not render Show More button if !hasMore', () => {
    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    expect(
      container.querySelector('.e2e-project-cards-show-more-button')
    ).not.toBeInTheDocument();
  });

  it('renders Show More button if hasMore', async () => {
    mockHasMore = true;

    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    expect(
      container.querySelector('.e2e-project-cards-show-more-button')
    ).toBeInTheDocument();
  });

  it('calls onLoadMore on click Show More button', () => {
    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const button = container.querySelector(
      '.e2e-project-cards-show-more-button'
    );
    fireEvent.click(button);

    expect(mockLoadMore).toHaveBeenCalledTimes(1);
  });

  it('sets the search term in the input properly', () => {
    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
        showSearch={true}
      />
    );

    const searchInput = container.querySelector('#search-input');
    fireEvent.change(searchInput, { target: { value: 'dog' } });
    screen.debug();

    expect(searchInput.value).toBe('dog');
  });

  it('calls onChangePublicationStatus of useAdminPublications on click tab', () => {
    render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    expect(mockChangePublicationStatus).toHaveBeenCalledWith(['published']);

    const tabs = screen.getAllByTestId('tab');

    // Published tab: currently selected
    fireEvent.click(tabs[0]);
    expect(mockChangePublicationStatus).toHaveBeenCalledTimes(1);

    // Archived tab
    fireEvent.click(tabs[1]);
    expect(mockChangePublicationStatus).toHaveBeenCalledWith(['archived']);
    expect(mockChangePublicationStatus).toHaveBeenCalledTimes(2);

    // All tab
    fireEvent.click(tabs[2]);
    expect(mockChangePublicationStatus).toHaveBeenCalledWith([
      'published',
      'archived',
    ]);
    expect(mockChangePublicationStatus).toHaveBeenCalledTimes(3);
  });

  it('does not render area filter if no areas', () => {
    mockAdminPublications = DEFAULT_ADMIN_PUBLICATIONS;
    mockStatusCounts = DEFAULT_STATUS_COUNTS;
    mockAreaData = [];

    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const filterSelector = container.querySelector(
      '.e2e-filter-selector-areas'
    );
    expect(filterSelector).not.toBeInTheDocument();
  });

  it('renders area filter if areas', () => {
    mockAreaData = DEFAULT_AREA_DATA;

    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const filterSelector = container.querySelector(
      '.e2e-filter-selector-areas'
    );
    expect(filterSelector).toBeInTheDocument();
  });

  it('calls onChangeAreas on change areas', () => {
    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const filterSelectorButton = container.querySelector(
      '.e2e-filter-selector-areas > .e2e-filter-selector-button'
    );

    // Open filter selector
    fireEvent.click(filterSelectorButton);

    // Get areas
    const areas = container.querySelectorAll('.e2e-checkbox');

    fireEvent.click(areas[0]);
    expect(mockChangeAreas).toHaveBeenCalledWith(['1']);
    expect(mockChangeAreas2).toHaveBeenCalledWith(['1']);

    fireEvent.click(areas[1]);
    expect(mockChangeAreas).toHaveBeenCalledWith(['1', '2']);
    expect(mockChangeAreas2).toHaveBeenCalledWith(['1', '2']);

    fireEvent.click(areas[0]);
    expect(mockChangeAreas).toHaveBeenCalledWith(['2']);
    expect(mockChangeAreas2).toHaveBeenCalledWith(['2']);

    fireEvent.click(areas[1]);
    expect(mockChangeAreas).toHaveBeenCalledWith([]);
    expect(mockChangeAreas2).toHaveBeenCalledWith([]);
  });

  it('does not render topic filter if no topics', () => {
    mockTopicData = [];

    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const filterSelector = container.querySelector(
      '.e2e-filter-selector-topics'
    );
    expect(filterSelector).not.toBeInTheDocument();
  });

  it('renders topic filter if topics', () => {
    mockTopicData = DEFAULT_TOPIC_DATA;

    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const filterSelector = container.querySelector(
      '.e2e-filter-selector-topics'
    );
    expect(filterSelector).toBeInTheDocument();
  });

  it('calls onChangeTopics on change topics', () => {
    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const filterSelector = container.querySelector(
      '.e2e-filter-selector-topics > .e2e-filter-selector-button'
    );

    // Open filter selector
    fireEvent.click(filterSelector);

    // Get topics
    const topics = container.querySelectorAll('.e2e-checkbox');

    fireEvent.click(topics[0]);
    expect(mockChangeTopics).toHaveBeenCalledWith(['1']);
    expect(mockChangeTopics2).toHaveBeenCalledWith(['1']);

    fireEvent.click(topics[1]);
    expect(mockChangeTopics).toHaveBeenCalledWith(['1', '2']);
    expect(mockChangeTopics2).toHaveBeenCalledWith(['1', '2']);

    fireEvent.click(topics[0]);
    expect(mockChangeTopics).toHaveBeenCalledWith(['2']);
    expect(mockChangeTopics2).toHaveBeenCalledWith(['2']);

    fireEvent.click(topics[1]);
    expect(mockChangeTopics).toHaveBeenCalledWith([]);
    expect(mockChangeTopics2).toHaveBeenCalledWith([]);
  });

  it('renders filter label if topics and/or areas', () => {
    render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    expect(screen.getByText('Filter by')).toBeInTheDocument();
  });

  it('does not render filter label if no topics and no areas', () => {
    mockTopicData = [];
    mockAreaData = [];

    render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    expect(screen.queryByText('Filter by')).not.toBeInTheDocument();
  });

  it('if only published admin pubs: renders only Active tab', () => {
    mockAdminPublications = [
      { publicationId: '1', publicationType: 'project' },
      { publicationId: '2', publicationType: 'project' },
      { publicationId: '3', publicationType: 'project' },
    ];

    mockStatusCounts = {
      published: 3,
      all: 3,
    };

    render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const tabs = screen.getAllByTestId('tab');
    expect(tabs).toHaveLength(1);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('if only archived admin pubs: renders only All tab', () => {
    mockAdminPublications = [
      { publicationId: '4', publicationType: 'project' },
      { publicationId: '5', publicationType: 'project' },
    ];

    mockStatusCounts = {
      archived: 2,
      all: 2,
    };

    render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const tabs = screen.getAllByTestId('tab');
    expect(tabs).toHaveLength(1);
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  describe('desktop layout', () => {
    it('if admin pubs but none in current tab: renders tabs, filters, and empty container', () => {
      mockLoadingInitial = false;
      mockSmallerThanMinTablet = false;
      mockAdminPublications = [];
      mockStatusCounts = {
        archived: 2,
        all: 2,
      };
      mockTopicData = DEFAULT_TOPIC_DATA;
      mockAreaData = DEFAULT_AREA_DATA;

      const { container } = render(
        <ProjectAndFolderCards
          publicationStatusFilter={['published', 'archived']}
          showTitle={true}
          layout={'dynamic'}
        />
      );

      const tabs = screen.getAllByTestId('tab');
      expect(tabs).toHaveLength(1);

      const filterSelectorTopics = container.querySelector(
        '.e2e-filter-selector-topics'
      );
      expect(filterSelectorTopics).toBeInTheDocument();

      const filterSelectorAreas = container.querySelector(
        '.e2e-filter-selector-areas'
      );
      expect(filterSelectorAreas).toBeInTheDocument();

      const emptyContainer = container.querySelector('#projects-empty');
      expect(emptyContainer).toBeInTheDocument();
    });

    it('if no admin pubs at all: does not render tabs and filters, renders empty container', () => {
      mockAdminPublications = [];
      mockStatusCounts = {
        all: 0,
      };

      const { container } = render(
        <ProjectAndFolderCards
          publicationStatusFilter={['published', 'archived']}
          showTitle={true}
          layout={'dynamic'}
        />
      );

      const tab = screen.queryByTestId('tab');
      expect(tab).not.toBeInTheDocument();

      const filterSelectorTopics = container.querySelector(
        '.e2e-filter-selector-topics'
      );
      expect(filterSelectorTopics).not.toBeInTheDocument();

      const filterSelectorAreas = container.querySelector(
        '.e2e-filter-selector-areas'
      );
      expect(filterSelectorAreas).not.toBeInTheDocument();

      const emptyContainer = container.querySelector('#projects-empty');
      expect(emptyContainer).toBeInTheDocument();
    });
  });

  describe('mobile layout', () => {
    it('if admin pubs but none in current tab: renders tabs and empty container, no filters', () => {
      mockLoadingInitial = false;
      mockSmallerThanMinTablet = true;
      mockAdminPublications = [];
      mockStatusCounts = {
        archived: 2,
        all: 2,
      };

      const { container } = render(
        <ProjectAndFolderCards
          publicationStatusFilter={['published', 'archived']}
          showTitle={true}
          layout={'dynamic'}
        />
      );

      const tabs = screen.getAllByTestId('tab');
      expect(tabs).toHaveLength(1);

      const filterSelectorTopics = container.querySelector(
        '.e2e-filter-selector-topics'
      );
      expect(filterSelectorTopics).not.toBeInTheDocument();

      const filterSelectorAreas = container.querySelector(
        '.e2e-filter-selector-areas'
      );
      expect(filterSelectorAreas).not.toBeInTheDocument();

      const emptyContainer = container.querySelector('#projects-empty');
      expect(emptyContainer).toBeInTheDocument();
    });

    it('if no admin pubs at all: does not render tabs and filters, renders empty container', () => {
      mockAdminPublications = [];
      mockStatusCounts = {
        all: 0,
      };

      const { container } = render(
        <ProjectAndFolderCards
          publicationStatusFilter={['published', 'archived']}
          showTitle={true}
          layout={'dynamic'}
        />
      );

      const tab = screen.queryByTestId('tab');
      expect(tab).not.toBeInTheDocument();

      const filterSelectorTopics = container.querySelector(
        '.e2e-filter-selector-topics'
      );
      expect(filterSelectorTopics).not.toBeInTheDocument();

      const filterSelectorAreas = container.querySelector(
        '.e2e-filter-selector-areas'
      );
      expect(filterSelectorAreas).not.toBeInTheDocument();

      const emptyContainer = container.querySelector('#projects-empty');
      expect(emptyContainer).toBeInTheDocument();
    });
  });
});
