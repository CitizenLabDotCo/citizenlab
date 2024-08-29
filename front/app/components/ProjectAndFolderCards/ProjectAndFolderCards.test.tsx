import React from 'react';

import { getTheme } from '@citizenlab/cl2-component-library';
import * as styledComponents from 'styled-components';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { IStatusCounts } from 'api/admin_publications_status_counts/types';
import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';

import { render, screen, fireEvent } from 'utils/testUtils/rtl';

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
  {
    id: '1',
    relationships: { publication: { data: { id: '1', type: 'project' } } },
  },
  {
    id: '2',
    relationships: { publication: { data: { id: '2', type: 'project' } } },
  },
  {
    id: '3',
    relationships: { publication: { data: { id: '3', type: 'project' } } },
  },
  {
    id: '4',
    relationships: { publication: { data: { id: '4', type: 'project' } } },
  },
  {
    id: '5',
    relationships: { publication: { data: { id: '5', type: 'project' } } },
  },
];

let mockAdminPublications = DEFAULT_ADMIN_PUBLICATIONS;

let mockHasMore = false;
let mockLoadingInitial = true;
const mockLoadingMore = false;
const mockLoadMore = jest.fn();

// Needed to render folder with project inside
jest.mock('api/admin_publications/useAdminPublications', () => {
  return jest.fn(() => ({
    hasNextPage: mockHasMore,
    isInitialLoading: mockLoadingInitial,
    isFetchingNextPage: mockLoadingMore,
    fetchNextPage: mockLoadMore,
    data: { pages: [{ data: mockAdminPublications }] },
  }));
});

const DEFAULT_STATUS_COUNTS: IStatusCounts = {
  data: {
    type: 'status_counts',
    attributes: {
      status_counts: {
        published: 3,
        archived: 2,
      },
    },
  },
};

let mockStatusCounts = DEFAULT_STATUS_COUNTS;

jest.mock(
  'api/admin_publications_status_counts/useAdminPublicationsStatusCounts',
  () =>
    jest.fn(() => ({
      data: mockStatusCounts,
    }))
);

jest.mock('api/app_configuration/useAppConfiguration', () =>
  jest.fn(() => ({
    data: {
      data: {
        attributes: {
          settings: {
            core: {
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

jest.mock('api/areas/useAreas', () =>
  jest.fn(() => ({ data: { data: mockAreaData } }))
);

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

    expect(searchInput.value).toBe('dog');
  });

  it('it changes status of useAdminPublications on click tab', () => {
    render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const tabs = screen.getAllByTestId('tab');

    // Published tab: currently selected
    fireEvent.click(tabs[0]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationStatusFilter: ['published'],
      })
    );

    // Archived tab
    fireEvent.click(tabs[1]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationStatusFilter: ['archived'],
      })
    );

    // All tab
    fireEvent.click(tabs[2]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationStatusFilter: ['published', 'archived'],
      })
    );
  });

  it('changes area on area selector click', () => {
    const { container, debug } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    debug();

    const filterSelectorButton = container.querySelector(
      '.e2e-filter-selector-areas .e2e-filter-selector-button'
    );

    // Open filter selector
    fireEvent.click(filterSelectorButton);

    // Get areas
    const areas = container.querySelectorAll('.e2e-checkbox');

    fireEvent.click(areas[0]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        areaIds: ['1'],
      })
    );
    expect(useAdminPublicationsStatusCounts).toHaveBeenCalledWith(
      expect.objectContaining({
        areaIds: ['1'],
      })
    );

    fireEvent.click(areas[1]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        areaIds: ['1', '2'],
      })
    );
    expect(useAdminPublicationsStatusCounts).toHaveBeenCalledWith(
      expect.objectContaining({
        areaIds: ['1', '2'],
      })
    );

    fireEvent.click(areas[0]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        areaIds: ['2'],
      })
    );
    expect(useAdminPublicationsStatusCounts).toHaveBeenCalledWith(
      expect.objectContaining({
        areaIds: ['2'],
      })
    );

    fireEvent.click(areas[1]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        areaIds: [],
      })
    );
    expect(useAdminPublicationsStatusCounts).toHaveBeenCalledWith(
      expect.objectContaining({
        areaIds: [],
      })
    );
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

  it('changes topic on topic selector click', () => {
    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const filterSelector = container.querySelector(
      '.e2e-filter-selector-topics .e2e-filter-selector-button'
    );

    // Open filter selector
    fireEvent.click(filterSelector);

    // Get topics
    const topics = container.querySelectorAll('.e2e-checkbox');

    fireEvent.click(topics[0]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        topicIds: ['1'],
      })
    );
    expect(useAdminPublicationsStatusCounts).toHaveBeenCalledWith(
      expect.objectContaining({
        topicIds: ['1'],
      })
    );

    fireEvent.click(topics[1]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        topicIds: ['1', '2'],
      })
    );
    expect(useAdminPublicationsStatusCounts).toHaveBeenCalledWith(
      expect.objectContaining({
        topicIds: ['1', '2'],
      })
    );

    fireEvent.click(topics[0]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        topicIds: ['2'],
      })
    );
    expect(useAdminPublicationsStatusCounts).toHaveBeenCalledWith(
      expect.objectContaining({
        topicIds: ['2'],
      })
    );

    fireEvent.click(topics[1]);
    expect(useAdminPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        topicIds: [],
      })
    );
    expect(useAdminPublicationsStatusCounts).toHaveBeenCalledWith(
      expect.objectContaining({
        topicIds: [],
      })
    );
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
      {
        id: '1',
        relationships: { publication: { data: { id: '1', type: 'project' } } },
      },
      {
        id: '2',
        relationships: { publication: { data: { id: '2', type: 'project' } } },
      },
      {
        id: '3',
        relationships: { publication: { data: { id: '3', type: 'project' } } },
      },
    ];

    mockStatusCounts = {
      data: {
        type: 'status_counts',
        attributes: {
          status_counts: {
            published: 3,
          },
        },
      },
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
      {
        id: '4',
        relationships: { publication: { data: { id: '4', type: 'project' } } },
      },
      {
        id: '5',
        relationships: { publication: { data: { id: '5', type: 'project' } } },
      },
    ];

    mockStatusCounts = {
      data: {
        type: 'status_counts',
        attributes: {
          status_counts: {
            archived: 2,
          },
        },
      },
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
        data: {
          type: 'status_counts',
          attributes: {
            status_counts: {
              archived: 2,
            },
          },
        },
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
        data: {
          type: 'status_counts',
          attributes: {
            status_counts: {},
          },
        },
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
        data: {
          type: 'status_counts',
          attributes: {
            status_counts: {
              archived: 2,
            },
          },
        },
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
        data: {
          type: 'status_counts',
          attributes: {
            status_counts: {},
          },
        },
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
