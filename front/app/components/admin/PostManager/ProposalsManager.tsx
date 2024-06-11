import React, { ChangeEvent, Suspense, lazy, useEffect, useState } from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import useInitiativeStatuses from 'api/initiative_statuses/useInitiativeStatuses';
import { IQueryParameters, Sort } from 'api/initiatives/types';
import useInitiatives from 'api/initiatives/useInitiatives';
import useTopics from 'api/topics/useTopics';

import Outlet from 'components/Outlet';

import { getPageNumberFromUrl, getSortDirection } from 'utils/paginationUtils';

import ActionBar from './components/ActionBar';
import FilterSidebar from './components/FilterSidebar';
import InitiativesCount from './components/InitiativesCount';
import PostTable from './components/PostTable';
import LazyStatusChangeModal from './components/StatusChangeModal/LazyStatusChangeModal';
import InitiativeFeedbackToggle from './components/TopLevelFilters/InitiativeFeedbackToggle';

import {
  LeftColumn,
  MiddleColumn,
  MiddleColumnTop,
  PreviewMode,
  Sticky,
  StyledExportMenu,
  StyledInput,
  ThreeColumns,
  TopActionBar,
} from '.';

const LazyPostPreview = lazy(
  () => import('components/admin/PostManager/components/PostPreview')
);
type TFilterMenu = 'topics' | 'statuses';

interface Props {
  visibleFilterMenus: TFilterMenu[]; // cannot be empty.
  defaultFilterMenu: TFilterMenu;
}

const ProposalsManager = ({ defaultFilterMenu, visibleFilterMenus }: Props) => {
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [activeFilterMenu, setActiveFilterMenu] =
    useState<TFilterMenu>(defaultFilterMenu);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const { data: initiativeStatuses } = useInitiativeStatuses();
  const { data: initiativeTopics } = useTopics({ excludeCode: 'custom' });
  const [queryParameters, setQueryParameters] = useState<IQueryParameters>({
    pageSize: 10,
    sort: 'new',
  });
  const { data: initiatives } = useInitiatives(queryParameters);

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

  if (!initiatives || !initiativeTopics) return null;

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
    setQueryParameters({ ...queryParameters, pageNumber: 1, topics });
  };

  const onChangeStatus = (initiativeStatus: string) => {
    setQueryParameters({
      ...queryParameters,
      pageNumber: 1,
      initiative_status: initiativeStatus,
    });
  };

  const onChangeAssignee = (assignee: string | undefined) => {
    setQueryParameters({ ...queryParameters, pageNumber: 1, assignee });
  };

  const onChangeFeedbackFilter = (feedbackNeeded: boolean | undefined) => {
    setQueryParameters({
      ...queryParameters,
      pageNumber: 1,
      feedback_needed: feedbackNeeded,
    });
  };

  const onResetParams = () => {
    setQueryParameters({});
  };

  const onChangePage = (pageNumber: number) => {
    setQueryParameters({ ...queryParameters, pageNumber });
  };

  const onChangeSearchTerm = (event: ChangeEvent<HTMLInputElement>) => {
    setQueryParameters({
      ...queryParameters,
      pageNumber: 1,
      search: event.target.value,
    });
  };

  const onChangeSorting = (sort: Sort) => {
    setQueryParameters({ ...queryParameters, pageNumber: 1, sort });
  };

  const currentPage = getPageNumberFromUrl(initiatives.links.self);
  const lastPage = getPageNumberFromUrl(initiatives.links.last);

  return (
    <>
      <TopActionBar>
        <Outlet
          id="app.components.admin.PostManager.topActionBar"
          assignee={queryParameters.assignee}
          handleAssigneeFilterChange={onChangeAssignee}
          type={'Initiatives'}
        />
        <InitiativeFeedbackToggle
          value={queryParameters.feedback_needed || false}
          onChange={onChangeFeedbackFilter}
          queryParameters={queryParameters}
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
          <InitiativesCount queryParameters={queryParameters} />
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
              selectedTopics={queryParameters.topics}
              selectedStatus={queryParameters.initiative_status}
              onChangeTopicsFilter={onChangeTopics}
              onChangeStatusFilter={onChangeStatus}
            />
          </Sticky>
        </LeftColumn>
        <MiddleColumn>
          <PostTable
            type="Initiatives"
            activeFilterMenu={activeFilterMenu}
            sortAttribute={queryParameters.sort}
            sortDirection={
              queryParameters.sort
                ? getSortDirection(queryParameters.sort)
                : 'ascending'
            }
            onChangeSort={onChangeSorting}
            posts={initiatives.data}
            statuses={initiativeStatuses?.data ?? []}
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
};

export default (inputProps: Props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProposalsManager {...inputProps} />
    </DndProvider>
  );
};
