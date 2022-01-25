import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import * as componentLibrary from '@citizenlab/cl2-component-library';
import * as styledComponents from 'styled-components';

import ProjectAndFolderCards from '.';

// Mock external libraries
jest
  .spyOn(componentLibrary, 'useWindowSize')
  .mockReturnValue({ windowWidth: 1000, windowHeight: 800 });
jest
  .spyOn(styledComponents, 'useTheme')
  .mockReturnValue(componentLibrary.getTheme());

// Mock hooks
const mockAdminPublications = [
  { publicationId: '1', publicationType: 'project' },
  { publicationId: '2', publicationType: 'project' },
  { publicationId: '3', publicationType: 'project' },
  { publicationId: '4', publicationType: 'project' },
  { publicationId: '5', publicationType: 'project' },
];

let mockHasMore = false;
let mockLoadingInitial = true;
let mockLoadingMore = false;
const mockLoadMore = jest.fn();
const mockChangeAreas = jest.fn();
const mockChangePublicationStatus = jest.fn();

jest.mock('hooks/useAdminPublications', () =>
  jest.fn(() => ({
    list: mockAdminPublications,
    hasMore: mockHasMore,
    loadingInitial: mockLoadingInitial,
    loadingMore: mockLoadingMore,
    onLoadMore: mockLoadMore,
    onChangeAreas: mockChangeAreas,
    onChangePublicationStatus: mockChangePublicationStatus,
  }))
);

const mockStatusCounts = {
  published: 3,
  archived: 2,
  all: 5,
};

const mockChangeAreas2 = jest.fn();
const mockChangePublicationStatus2 = jest.fn();

jest.mock('hooks/useAdminPublicationsStatusCounts', () =>
  jest.fn(() => ({
    counts: mockStatusCounts,
    onChangeAreas: mockChangeAreas2,
    onChangePublicationStatus: mockChangePublicationStatus2,
  }))
);

jest.mock('hooks/useLocalize');
jest.mock('hooks/useLocale');

jest.mock('hooks/useAppConfiguration', () =>
  jest.fn(() => ({
    data: {
      attributes: {
        settings: {
          core: {
            currently_working_on_text: { en: 'Working on text' },
            areas_term: { en: 'Areas' },
          },
        },
      },
    },
  }))
);

const mockAreaData = [
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

jest.mock('hooks/useAreas', () =>
  jest.fn(() => ({
    data: mockAreaData,
  }))
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
jest.mock('utils/cl-intl');
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
      container.querySelector('#e2e-projects-list')
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
    expect(container.querySelector('#e2e-projects-list')).toBeInTheDocument();
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

    fireEvent.click(tabs[0]);
    expect(mockChangePublicationStatus).toHaveBeenCalledTimes(1);

    fireEvent.click(tabs[1]);
    expect(mockChangePublicationStatus).toHaveBeenCalledWith(['archived']);
    expect(mockChangePublicationStatus).toHaveBeenCalledTimes(2);

    fireEvent.click(tabs[2]);
    expect(mockChangePublicationStatus).toHaveBeenCalledWith([
      'published',
      'archived',
    ]);
    expect(mockChangePublicationStatus).toHaveBeenCalledTimes(3);
  });

  it('calls onChangeAreas on change areas', () => {
    const { container } = render(
      <ProjectAndFolderCards
        publicationStatusFilter={['published', 'archived']}
        showTitle={true}
        layout={'dynamic'}
      />
    );

    const filterSelector = container.querySelector(
      '.e2e-filter-selector-button'
    );

    // Open filter selector
    fireEvent.click(filterSelector);

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
});
