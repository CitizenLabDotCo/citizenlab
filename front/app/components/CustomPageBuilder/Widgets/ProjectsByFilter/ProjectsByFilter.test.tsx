import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import ProjectsByFilter from '.';

let inBuilder = true;
jest.mock('@craftjs/core', () => ({
  useEditor: (collect: (state: { options: { enabled: boolean } }) => unknown) =>
    collect({ options: { enabled: inBuilder } }),
  useNode: jest.fn(),
}));

const statusCountsCall = jest.fn();
jest.mock(
  'api/admin_publications_status_counts/useAdminPublicationsStatusCounts',
  () => ({
    __esModule: true,
    default: (params: unknown, options: unknown) => {
      statusCountsCall(params, options);
      return { data: { data: { attributes: { status_counts: {} } } } };
    },
  })
);

jest.mock('api/admin_publications/useAdminPublications', () => ({
  __esModule: true,
  default: () => ({ data: undefined, isLoading: true }),
}));

const sectionBackground = jest.fn();
jest.mock('components/ProjectPageBuilder/Widgets/SectionBackground', () => ({
  __esModule: true,
  default: ({
    colored,
    children,
  }: {
    colored: boolean;
    children: React.ReactNode;
  }) => {
    sectionBackground({ colored });
    return <div>{children}</div>;
  },
}));
jest.mock('components/ProjectPageBuilder/Widgets/useIsPageBodyChild', () => ({
  __esModule: true,
  default: () => true,
}));

const cards = jest.fn();
jest.mock(
  'components/ProjectAndFolderCards/ProjectAndFolderCardsInner',
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      cards(props);
      return <div data-testid="project-cards" />;
    },
  })
);

describe('ProjectsByFilter', () => {
  beforeEach(() => {
    inBuilder = true;
    statusCountsCall.mockClear();
    cards.mockClear();
    sectionBackground.mockClear();
  });

  it('renders on white unless an admin asks for a coloured band', () => {
    render(<ProjectsByFilter filterType="areas" ids={['area-1']} />);

    expect(sectionBackground).toHaveBeenCalledWith({ colored: false });
  });

  it('renders a coloured band when set, which is what migration sets', () => {
    render(
      <ProjectsByFilter
        filterType="areas"
        ids={['area-1']}
        sectionBackground="colored"
      />
    );

    expect(sectionBackground).toHaveBeenCalledWith({ colored: true });
  });

  it('shows no heading until a title is written', () => {
    render(<ProjectsByFilter filterType="areas" ids={['area-1']} />);

    expect(cards).toHaveBeenCalledWith(
      expect.objectContaining({ showTitle: false })
    );
  });

  it('shows the heading an admin wrote', () => {
    const titleMultiloc = { en: 'Projects near you' };
    render(
      <ProjectsByFilter
        filterType="areas"
        ids={['area-1']}
        titleMultiloc={titleMultiloc}
      />
    );

    expect(cards).toHaveBeenCalledWith(
      expect.objectContaining({
        showTitle: true,
        currentlyWorkingOnText: titleMultiloc,
      })
    );
  });

  it('ignores a title that is only whitespace', () => {
    render(
      <ProjectsByFilter
        filterType="areas"
        ids={['area-1']}
        titleMultiloc={{ en: '   ' }}
      />
    );

    expect(cards).toHaveBeenCalledWith(
      expect.objectContaining({ showTitle: false })
    );
  });

  it('prompts for a selection in the builder when nothing is picked', () => {
    render(<ProjectsByFilter filterType="areas" ids={[]} />);

    expect(screen.getByText(/pick at least one/i)).toBeInTheDocument();
    expect(screen.queryByTestId('project-cards')).not.toBeInTheDocument();
  });

  it('renders nothing in the front office when nothing is picked', () => {
    inBuilder = false;
    render(<ProjectsByFilter filterType="areas" ids={[]} />);

    expect(screen.queryByText(/pick at least one/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('project-cards')).not.toBeInTheDocument();
  });

  it('sends only the selected dimension to the API', () => {
    render(<ProjectsByFilter filterType="areas" ids={['area-1']} />);

    expect(statusCountsCall).toHaveBeenCalledWith(
      expect.objectContaining({
        areaIds: ['area-1'],
        globalTopics: undefined,
        spaceIds: undefined,
      }),
      expect.anything()
    );
  });

  // Spaces carry folders as well as projects.
  it('pages over top-level publications when filtering by space', () => {
    render(<ProjectsByFilter filterType="spaces" ids={['space-1']} />);

    expect(statusCountsCall).toHaveBeenCalledWith(
      expect.objectContaining({ rootLevelOnly: true, onlyProjects: false }),
      expect.anything()
    );
  });
});
