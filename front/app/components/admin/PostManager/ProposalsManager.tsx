import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { IQueryParameters, Sort } from 'api/initiatives/types';
// api
import useInitiativeStatuses from 'api/initiative_statuses/useInitiativeStatuses';
import useTopics from 'api/topics/useTopics';
import { getPageNumberFromUrl, getSortDirection } from 'utils/paginationUtils';

// components
import {
  LeftColumn,
  MiddleColumn,
  MiddleColumnTop,
  Sticky,
  StyledExportMenu,
  StyledInput,
  ThreeColumns,
  TopActionBar,
} from '.';
import ActionBar from './components/ActionBar';
import FilterSidebar from './components/FilterSidebar';
import PostTable from './components/PostTable';
import InfoSidebar from './components/InfoSidebar';
import InitiativesCount from './components/InitiativesCount';
import FeedbackToggle from './components/TopLevelFilters/FeedbackToggle';
const LazyPostPreview = lazy(
  () => import('components/admin/PostManager/components/PostPreview')
);

import LazyStatusChangeModal from './components/StatusChangeModal/LazyStatusChangeModal';
import Outlet from 'components/Outlet';

// typings
import { IInitiativeStatuses } from 'api/initiative_statuses/types';
import { ITopics } from 'api/topics/types';
import useInitiatives from 'api/initiatives/useInitiatives';

interface InputProps {
  // filters settings
  // the filters needed for this view, in the order they'll be shown, first one active by default
  visibleFilterMenus: TFilterMenu[]; // cannot be empty.
  defaultFilterMenu: TFilterMenu;
}

interface Props extends InputProps {
  postStatuses?: IInitiativeStatuses;
  topicsData?: ITopics['data'];
}

export type TFilterMenu = 'topics' | 'statuses';
export type PreviewMode = 'view' | 'edit';

const ProposalsManager = ({ defaultFilterMenu, visibleFilterMenus }: Props) => {
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [activeFilterMenu, setActiveFilterMenu] =
    useState<TFilterMenu>(defaultFilterMenu);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const { data: initiativeStatuses } = useInitiativeStatuses();
  const { data: initiativeTopics } = useTopics({ excludeCode: 'custom' });
  const [filter, setFilters] = useState<IQueryParameters>({});
  const { data: initiatives } = useInitiatives({
    pageSize: 10,
    sort: 'new',
    search: filter.search,
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

  if (!initiatives) return null;

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
  // End Modal Preview

  const onChangeTopics = (topics: string[]) => {
    setFilters({ ...filter, topics });
  };
  const onChangeStatus = (initiativeStatus: string | null) => {
    setFilters({ ...filter, initiative_status: initiativeStatus });
  };
  const onChangeAssignee = (assignee: string | undefined) => {
    setFilters({ ...filter, assignee });
  };

  const onChangeFeedbackFilter = (feedbackNeeded: boolean) => {
    setFilters({ ...filter, feedback_needed: feedbackNeeded });
  };

  const onResetParams = () => {
    setFilters({});
  };

  const onChangePage = (pageNumber: number) => {
    setFilters({ ...filter, pageNumber });
  };

  const onChangeSearchTerm = (search: string) => {
    setFilters({ ...filter, search });
  };

  const onChangeSorting = (sort: Sort) => {
    setFilters({ ...filter, sort });
  };

  const currentPage = getPageNumberFromUrl(initiatives.links.self);
  const lastPage = getPageNumberFromUrl(initiatives.links.last);
  const selectedTopics = filter.topics;
  const selectedAssignee = filter.assignee;
  const feedbackNeeded = filter.feedback_needed || false;
  const selectedStatus = filter.initiative_status;

  if (initiativeTopics) {
    return (
      <>
        <TopActionBar>
          <Outlet
            id="app.components.admin.PostManager.topActionBar"
            assignee={selectedAssignee}
            handleAssigneeFilterChange={onChangeAssignee}
            type={'Initiatives'}
          />
          <FeedbackToggle
            type={'Initiatives'}
            value={feedbackNeeded}
            onChange={onChangeFeedbackFilter}
            topics={selectedTopics}
            status={selectedStatus}
            assignee={selectedAssignee}
            searchTerm={filter.search}
          />
          <StyledExportMenu type={'Initiatives'} selection={selection} />
        </TopActionBar>

        <ThreeColumns>
          <LeftColumn>
            <ActionBar
              type={'Initiatives'}
              selection={selection}
              resetSelection={resetSelection}
              handleClickEdit={openPreviewEdit}
            />
          </LeftColumn>
          <MiddleColumnTop>
            <InitiativesCount
              feedbackNeeded={feedbackNeeded}
              topics={selectedTopics}
              initiativeStatus={selectedStatus}
              searchTerm={filter.search}
              assignee={selectedAssignee}
            />
            <StyledInput icon="search" onChange={onChangeSearchTerm} />
          </MiddleColumnTop>
        </ThreeColumns>
        <ThreeColumns>
          <LeftColumn>
            <Sticky>
              <FilterSidebar
                type="Initiatives"
                activeFilterMenu={activeFilterMenu}
                visibleFilterMenus={visibleFilterMenus}
                onChangeActiveFilterMenu={handleChangeActiveFilterMenu}
                statuses={initiativeStatuses?.data ?? []}
                topics={initiativeTopics.data}
                selectedTopics={selectedTopics}
                selectedStatus={selectedStatus}
                onChangeTopicsFilter={onChangeTopics}
                onChangeStatusFilter={onChangeStatus}
              />
            </Sticky>
          </LeftColumn>
          <MiddleColumn>
            <PostTable
              type="Initiatives"
              activeFilterMenu={activeFilterMenu}
              sortAttribute={filter.sort}
              sortDirection={
                filter.sort ? getSortDirection(filter.sort) : 'ascending'
              }
              onChangeSort={onChangeSorting}
              posts={initiatives.data}
              statuses={initiativeStatuses?.data ?? []}
              selection={selection}
              onChangeSelection={setSelection}
              currentPageNumber={
                typeof currentPage === 'number' ? currentPage : undefined
              }
              lastPageNumber={
                typeof lastPage === 'number' ? lastPage : undefined
              }
              onChangePage={onChangePage}
              handleSeeAll={onResetParams}
              openPreview={openPreview}
            />
          </MiddleColumn>
          <InfoSidebar postIds={[...selection]} openPreview={openPreview} />
        </ThreeColumns>
        <Suspense fallback={null}>
          <LazyPostPreview
            type="Initiatives"
            postId={previewPostId}
            mode={previewMode}
            onClose={closePreview}
            onSwitchPreviewMode={switchPreviewMode}
          />
        </Suspense>
        <Suspense fallback={null}>
          <LazyStatusChangeModal />
        </Suspense>
      </>
    );
  }

  return null;
};

export default (inputProps: InputProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProposalsManager {...inputProps} />;
    </DndProvider>
  );
};
