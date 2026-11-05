import React, { Suspense, lazy, useEffect, useState } from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { IIdeaQueryParameters, Sort } from 'api/ideas/types';
import useIdeas from 'api/ideas/useIdeas';
import useInputTopics from 'api/input_topics/useInputTopics';

import Outlet from 'components/Outlet';
import SearchInput from 'components/UI/SearchInput';

import { getPageNumberFromUrl, getSortDirection } from 'utils/paginationUtils';

import ActionBar from './components/ActionBar';
import FilterSidebar from './components/FilterSidebar';
import IdeasCount from './components/IdeasCount';
import PostTable from './components/PostTable';
import IdeaFeedbackToggle from './components/TopLevelFilters/IdeaFeedbackToggle';

import {
  LeftColumn,
  MiddleColumn,
  MiddleColumnTop,
  PreviewMode,
  Sticky,
  StyledExportMenu,
  ThreeColumns,
  TopActionBar,
} from '.';

const LazyPostPreview = lazy(
  () => import('components/admin/PostManager/components/PostPreview')
);
type TFilterMenu = 'topics' | 'statuses';

interface Props {
  projectId: string;
  phaseId: string;
  visibleFilterMenus: TFilterMenu[]; // cannot be empty.
  defaultFilterMenu: TFilterMenu;
}

/*
  There are still some minor differences between the ProjectProposalsManager and InputManager. 
  - Unlike ideas, proposals cannot be moved between phases, they can only belong to a single phase. And you can select that phase from the phase navigation on top. So there is no need to have the phase filters in the left sidebar.
  - Also, the statuses are different for proposals and ideation so we need to display a different list there.
*/
const ProjectProposalsManager = ({
  defaultFilterMenu,
  visibleFilterMenus,
  projectId,
  phaseId,
}: Props) => {
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [activeFilterMenu, setActiveFilterMenu] =
    useState<TFilterMenu>(defaultFilterMenu);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const { data: ideaStatuses } = useIdeaStatuses({
    queryParams: { participation_method: 'proposals' },
  });
  const { data: proposalTopics } = useInputTopics(projectId);
  const [queryParameters, setQueryParameters] = useState<IIdeaQueryParameters>({
    sort: 'new',
    phase: phaseId,
  });
  const { data: proposals } = useIdeas({
    projects: [projectId],
    phase: phaseId,
    ...queryParameters,
  });

  useEffect(() => {
    setActiveFilterMenu((activeFilterMenu) => {
      if (
        !visibleFilterMenus.find((item) => item === activeFilterMenu) &&
        visibleFilterMenus[0]
      ) {
        return visibleFilterMenus[0];
      } else {
        return activeFilterMenu;
      }
    });
  }, [visibleFilterMenus]);

  if (!proposals) return null;

  const resetSelection = () => {
    setSelection(new Set());
  };
  // End selection management

  // Filter menu
  const handleChangeActiveFilterMenu = (activeFilterMenu: TFilterMenu) => {
    setActiveFilterMenu(activeFilterMenu);
  };
  // End Filter menu

  // Modal Preview
  const openPreview = (postId: string) => {
    setPreviewPostId(postId);
    setPreviewMode('view');
  };

  const openPreviewEdit = () => {
    const previewPostId = [...selection][0];
    if (selection.size === 1 && previewPostId) {
      setPreviewMode('edit');
      setPreviewPostId(previewPostId);
    }
  };

  const switchPreviewMode = () => {
    if (previewMode === 'edit') {
      setPreviewMode('view');
    } else {
      setPreviewMode('edit');
    }
  };

  const closePreview = () => {
    setPreviewPostId(null);
    setPreviewMode('view');
  };

  const onChangeTopics = (topics: string[]) => {
    setQueryParameters({
      ...queryParameters,
      'page[number]': 1,
      input_topics: topics,
    });
  };

  const onChangeStatus = (ideaStatus: string) => {
    setQueryParameters({
      ...queryParameters,
      'page[number]': 1,
      idea_status: ideaStatus,
    });
  };

  const onChangeAssignee = (assignee: string | undefined) => {
    setQueryParameters({ ...queryParameters, 'page[number]': 1, assignee });
  };

  const onChangeFeedbackFilter = (feedbackNeeded: boolean | undefined) => {
    setQueryParameters({
      ...queryParameters,
      'page[number]': 1,
      feedback_needed: feedbackNeeded,
    });
  };

  const onResetParams = () => {
    setQueryParameters({});
  };

  const onChangePage = (pageNumber: number) => {
    setQueryParameters({ ...queryParameters, 'page[number]': pageNumber });
  };

  const onChangeSearchTerm = (searchTerm: string) => {
    setQueryParameters({
      ...queryParameters,
      'page[number]': 1,
      search: searchTerm,
    });
  };

  const onChangeSorting = (sort: Sort) => {
    setQueryParameters({ ...queryParameters, 'page[number]': 1, sort });
  };

  const currentPage = getPageNumberFromUrl(proposals.links.self);
  const lastPage = getPageNumberFromUrl(proposals.links.last);

  return (
    <DndProvider backend={HTML5Backend}>
      <TopActionBar>
        <Outlet
          id="app.components.admin.PostManager.topActionBar"
          assignee={queryParameters.assignee}
          handleAssigneeFilterChange={onChangeAssignee}
          type={'ProjectProposals'}
        />
        <IdeaFeedbackToggle
          value={queryParameters.feedback_needed || false}
          onChange={onChangeFeedbackFilter}
          project={projectId}
          queryParameters={queryParameters}
        />
        <StyledExportMenu
          type={'ProjectProposals'}
          selectedProject={projectId}
          selection={selection}
        />
      </TopActionBar>

      <ThreeColumns>
        <LeftColumn>
          <ActionBar
            selection={selection}
            resetSelection={resetSelection}
            handleClickEdit={openPreviewEdit}
          />
        </LeftColumn>
        <MiddleColumnTop>
          <IdeasCount project={projectId} queryParameters={queryParameters} />
          <SearchInput
            onChange={onChangeSearchTerm}
            a11y_numberOfSearchResults={proposals.data.length}
          />
        </MiddleColumnTop>
      </ThreeColumns>
      <ThreeColumns>
        <LeftColumn>
          <Sticky>
            <FilterSidebar
              type="ProjectProposals"
              activeFilterMenu={activeFilterMenu}
              visibleFilterMenus={visibleFilterMenus}
              onChangeActiveFilterMenu={handleChangeActiveFilterMenu}
              topics={proposalTopics?.data ?? []}
              selectedTopics={queryParameters.input_topics}
              onChangeTopicsFilter={onChangeTopics}
              onChangeStatusFilter={onChangeStatus}
              statuses={ideaStatuses?.data ?? []}
              selectedStatus={queryParameters.idea_status}
              selectedPhase={queryParameters.phase}
            />
          </Sticky>
        </LeftColumn>
        <MiddleColumn>
          <PostTable
            type="ProjectProposals"
            activeFilterMenu={activeFilterMenu}
            sortAttribute={queryParameters.sort}
            sortDirection={
              queryParameters.sort
                ? getSortDirection(queryParameters.sort)
                : 'descending'
            }
            onChangeSort={onChangeSorting}
            posts={proposals.data}
            statuses={ideaStatuses?.data ?? []}
            selection={selection}
            onChangeSelection={setSelection}
            currentPageNumber={
              typeof currentPage === 'number' ? currentPage : undefined
            }
            lastPageNumber={typeof lastPage === 'number' ? lastPage : undefined}
            onChangePage={onChangePage}
            handleSeeAll={onResetParams}
            openPreview={openPreview}
          />
        </MiddleColumn>
      </ThreeColumns>
      <Suspense fallback={null}>
        <LazyPostPreview
          type="ProjectProposals"
          postId={previewPostId}
          mode={previewMode}
          onClose={closePreview}
          onSwitchPreviewMode={switchPreviewMode}
        />
      </Suspense>
    </DndProvider>
  );
};

export default ProjectProposalsManager;
