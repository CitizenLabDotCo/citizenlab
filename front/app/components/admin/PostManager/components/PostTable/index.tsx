import React from 'react';
import { every, isEmpty, isFunction } from 'lodash-es';

// components
import { Table, Tbody, Tfoot, Tr, Td } from '@citizenlab/cl2-component-library';
import Row from './Row';
import Pagination from 'components/admin/Pagination';
import NoPost from './NoPost';
import IdeaHeaderRow from './header/IdeaHeaderRow';
import InitiativesHeaderRow from './header/InitiativesHeaderRow';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

// services
import { IPhaseData } from 'api/phases/types';
import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IInitiativeStatusData } from 'api/initiative_statuses/types';

// styling
import styled from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';

// i18n
import { ManagerType, TFilterMenu } from '../..';

// typings
import {
  SortAttribute as IdeasSortAttribute,
  Sort as IdeasSort,
  IIdeaData,
} from 'api/ideas/types';
import { SortAttribute as InitiativesSortAttribute } from 'resources/GetInitiatives';
import {
  IInitiativeData,
  Sort as InitiativesSort,
} from 'api/initiatives/types';
import { SortDirection } from 'utils/paginationUtils';

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
  sortAttribute?: IdeasSortAttribute | InitiativesSortAttribute;
  sortDirection?: SortDirection;
  posts?: IIdeaData[] | IInitiativeData[];
  phases?: IPhaseData[];
  statuses?: IIdeaStatusData[] | IInitiativeStatusData[];
  onChangeSort?: (sort: IdeasSort | InitiativesSort) => void;
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  onChangeSelection: (newSelection: Set<string>) => void;
  currentPageNumber?: number;
  lastPageNumber?: number;
  onChangePage?: (number: number) => void;
  activeFilterMenu: TFilterMenu;
  handleSeeAll: () => void;
  openPreview: (ideaId: string) => void;
}

export default class PostTable extends React.Component<Props> {
  handleSortClick =
    (newSortAttribute: IdeasSortAttribute | InitiativesSortAttribute) => () => {
      const {
        sortAttribute: oldSortAttribute,
        sortDirection: oldSortDirection,
        onChangeSort,
      } = this.props;
      if (isFunction(onChangeSort)) {
        let newSortSign = '-';
        if (newSortAttribute === oldSortAttribute) {
          newSortSign = oldSortDirection === 'ascending' ? '-' : '';
        }
        onChangeSort(
          `${newSortSign}${newSortAttribute}` as IdeasSort | InitiativesSort
        );
      }
    };

  select = (postId: string) => () => {
    const { selection, onChangeSelection } = this.props;
    const newSelection = new Set(selection);
    newSelection.add(postId);
    onChangeSelection(newSelection);
  };

  unselect = (postId: string) => () => {
    const { selection, onChangeSelection } = this.props;
    const newSelection = new Set(selection);
    const success = newSelection.delete(postId);
    success && onChangeSelection(newSelection);
    return success;
  };

  toggleSelect = (postId: string) => () => {
    this.unselect(postId)() || this.select(postId)();
  };

  toggleSelectAll = () => {
    const { posts, onChangeSelection } = this.props;
    if (this.allSelected()) {
      onChangeSelection(new Set());
    } else {
      // TODO fix typings here, with the conditional type here, ts complains
      posts &&
        onChangeSelection(
          new Set((posts as IIdeaData[]).map((post) => post.id))
        );
    }
  };

  singleSelect = (postId: string) => () => {
    this.props.onChangeSelection(new Set([postId]));
  };

  handlePaginationClick = (page) => {
    this.props.onChangePage && this.props.onChangePage(page);
  };

  allSelected = () => {
    const { posts, selection } = this.props;
    return (
      !isEmpty(posts) &&
      every(posts, (post: IIdeaData | IInitiativeData) =>
        selection.has(post.id)
      )
    );
  };

  render() {
    const {
      type,
      sortAttribute,
      sortDirection,
      posts,
      selection,
      phases,
      activeFilterMenu,
      statuses,
      handleSeeAll,
      openPreview,
    } = this.props;

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
          {type === 'Initiatives' ? (
            <InitiativesHeaderRow
              sortAttribute={sortAttribute as InitiativesSortAttribute}
              sortDirection={sortDirection}
              allSelected={this.allSelected()}
              toggleSelectAll={this.toggleSelectAll}
              handleSortClick={this.handleSortClick}
            />
          ) : type === 'AllIdeas' || type === 'ProjectIdeas' ? (
            <IdeaHeaderRow
              sortAttribute={sortAttribute}
              sortDirection={sortDirection}
              allSelected={this.allSelected()}
              toggleSelectAll={this.toggleSelectAll}
              handleSortClick={this.handleSortClick}
            />
          ) : null}
          <Tbody>
            {!isEmpty(posts) ? (
              <TransitionGroup component={null}>
                {
                  // Cleanest workaround typescript I found
                  (posts as (IIdeaData | IInitiativeData)[]).map((post) => (
                    <CSSTransition
                      classNames="fade"
                      timeout={500}
                      key={post.id}
                    >
                      <Row
                        key={post.id}
                        type={type}
                        post={post}
                        phases={phases}
                        statuses={statuses}
                        onUnselect={this.unselect(post.id)}
                        onToggleSelect={this.toggleSelect(post.id)}
                        onSingleSelect={this.singleSelect(post.id)}
                        selection={selection}
                        activeFilterMenu={activeFilterMenu}
                        openPreview={openPreview}
                      />
                    </CSSTransition>
                  ))
                }
              </TransitionGroup>
            ) : null}
          </Tbody>
          {!isEmpty(posts) && (
            <Tfoot>
              <Tr background={colors.grey50}>
                <Td colSpan={7}>
                  <Pagination
                    currentPage={this.props.currentPageNumber || 1}
                    totalPages={this.props.lastPageNumber || 1}
                    loadPage={this.handlePaginationClick}
                  />
                </Td>
              </Tr>
            </Tfoot>
          )}
        </Table>
        {isEmpty(posts) && (
          <TransitionGroup component={null}>
            <CSSTransition classNames="fade" timeout={500}>
              <NoPost handleSeeAll={handleSeeAll} type={type} />
            </CSSTransition>
          </TransitionGroup>
        )}
      </Container>
    );
  }
}
