import React from 'react';

import {
  Table,
  Tbody,
  Tfoot,
  Tr,
  Td,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { every, isEmpty, isFunction } from 'lodash-es';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { Sort as IdeasSort, IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import Pagination from 'components/Pagination';

import { SortDirection } from 'utils/paginationUtils';

import { ManagerType, TFilterMenu } from '../..';

import IdeaHeaderRow from './header/IdeaHeaderRow';
import NoPost from './NoPost';
import Row from './Row';

const Container = styled.div`
  .ui.table {
    margin-bottom: 0;
  }

  tr {
    overflow: hidden;

    transition: all 500ms ease;
    &.fade-enter,
    &.fade-enter + tr {
      opacity: 0;
      height: 0;

      &.fade-enter-active,
      &.fade-enter-active + tr {
        opacity: 1;
        height: auto;
      }
    }

    &.fade-enter-done,
    &.fade-enter-done + tr {
      opacity: 1;
    }

    &.fade-exit,
    &.fade-exit + tr {
      opacity: 1;

      &.fade-exit-active,
      &.fade-exit-active + tr {
        opacity: 0;
        height: 0;
      }
    }

    &.fade-exit-done,
    &.fade-exit-done + tr {
      display: none;
    }
  }
`;

interface Props {
  type: ManagerType;
  sortAttribute?: IdeasSort;
  sortDirection?: SortDirection;
  posts: IIdeaData[];
  phases?: IPhaseData[];
  statuses?: IIdeaStatusData[];
  selectedPhaseId?: string | null;
  selectedProjectId?: string | null;
  onChangeSort?: (sort: IdeasSort) => void;
  /** A set of ids of ideas that are currently selected */
  selection: Set<string>;
  onChangeSelection: React.Dispatch<React.SetStateAction<Set<string>>>;
  currentPageNumber?: number;
  lastPageNumber?: number;
  onChangePage?: (number: number) => void;
  activeFilterMenu: TFilterMenu;
  handleSeeAll: () => void;
  openPreview: (ideaId: string) => void;
}

const PostTable = ({
  onChangeSort,
  selection,
  onChangeSelection,
  posts,
  onChangePage,
  type,
  sortAttribute,
  sortDirection,
  phases,
  activeFilterMenu,
  statuses,
  selectedProjectId,
  selectedPhaseId,
  handleSeeAll,
  openPreview,
  currentPageNumber,
  lastPageNumber,
}: Props) => {
  const handleSortClick = (newSortAttribute: IdeasSort) => () => {
    if (isFunction(onChangeSort)) {
      const currentSortAttribute = sortAttribute?.replace(/^-/, '');
      const isSameAttribute = currentSortAttribute === newSortAttribute;
      const newSortSign =
        isSameAttribute && sortDirection === 'descending' ? '-' : '';

      onChangeSort(`${newSortSign}${newSortAttribute}` as IdeasSort);
    }
  };

  const toggleSelect = (postId: string) => () => {
    onChangeSelection((currentSelection) => {
      const selectionClone = new Set([...currentSelection]);

      selectionClone.has(postId)
        ? selectionClone.delete(postId)
        : selectionClone.add(postId);

      return selectionClone;
    });
  };

  const toggleSelectAll = () => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!posts) return;

    onChangeSelection((currentSelection) => {
      if (allSelected(currentSelection)) {
        return new Set();
      } else {
        // TODO fix typings here, with the conditional type here, ts complains
        return new Set((posts as IIdeaData[]).map((post) => post.id));
      }
    });
  };

  const handlePaginationClick = (page) => {
    onChangePage && onChangePage(page);
  };

  const allSelected = (selection: Set<string>) => {
    return (
      !isEmpty(posts) &&
      every(posts, (post: IIdeaData) => selection.has(post.id))
    );
  };

  return (
    <Container>
      <Table
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{
          headerCells: true,
          bodyRows: true,
        }}
      >
        <IdeaHeaderRow
          type={type}
          selectedProjectId={selectedProjectId}
          selectedPhaseId={selectedPhaseId}
          sortAttribute={sortAttribute}
          sortDirection={sortDirection}
          allSelected={allSelected(selection)}
          toggleSelectAll={toggleSelectAll}
          handleSortClick={handleSortClick}
        />

        <Tbody>
          {!isEmpty(posts) ? (
            <TransitionGroup component={null}>
              {posts.map((post) => (
                <CSSTransition classNames="fade" timeout={500} key={post.id}>
                  <Row
                    key={post.id}
                    type={type}
                    post={post}
                    selection={selection}
                    activeFilterMenu={activeFilterMenu}
                    phases={phases}
                    statuses={statuses}
                    selectedProjectId={selectedProjectId}
                    selectedPhaseId={selectedPhaseId}
                    onToggleSelect={toggleSelect(post.id)}
                    openPreview={openPreview}
                  />
                </CSSTransition>
              ))}
            </TransitionGroup>
          ) : null}
        </Tbody>
        {!isEmpty(posts) && (
          <Tfoot>
            <Tr background={colors.grey50}>
              <Td colSpan={7}>
                <Pagination
                  currentPage={currentPageNumber || 1}
                  totalPages={lastPageNumber || 1}
                  loadPage={handlePaginationClick}
                />
              </Td>
            </Tr>
          </Tfoot>
        )}
      </Table>
      {isEmpty(posts) && (
        <TransitionGroup component={null}>
          <CSSTransition classNames="fade" timeout={500}>
            <NoPost handleSeeAll={handleSeeAll} />
          </CSSTransition>
        </TransitionGroup>
      )}
    </Container>
  );
};

export default PostTable;
