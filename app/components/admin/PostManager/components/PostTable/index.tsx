import React from 'react';
import { every, isEmpty, isFunction } from 'lodash-es';
import styled from 'styled-components';

// components
import { Table } from 'semantic-ui-react';
import Row from './Row';
import Pagination from 'components/admin/Pagination';
import NoPost from './NoPost';
import IdeaHeaderRow from './IdeaHeaderRow';
import InitiativesHeaderRow from './InitiativesHeaderRow';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

// services
import { IIdeaData } from 'services/ideas';
import { IInitiativeData } from 'services/initiatives';
import { IPhaseData } from 'services/phases';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { IInitiativeStatusData } from 'services/initiativeStatuses';

// resources
import { Sort, SortAttribute } from 'resources/GetIdeas';

// utils
import { SortDirection } from 'utils/paginationUtils';

// i18n
import { ManagerType, TFilterMenu } from '../..';

const Container = styled.div`
  .ui.table {
    margin-bottom: 0;
  }

  tr {
    overflow: hidden;

    transition: all 500ms ease;
    &.fade-enter, &.fade-enter + tr {
      opacity: 0;
      height: 0;

      &.fade-enter-active, &.fade-enter-active + tr {
        opacity: 1;
        height: auto;
      }
    }

    &.fade-enter-done, &.fade-enter-done + tr {
      opacity: 1;
    }

    &.fade-exit, &.fade-exit + tr {
      opacity: 1;

      &.fade-exit-active, &.fade-exit-active + tr {
        opacity: 0;
        height: 0;
      }
    }

    &.fade-exit-done, &.fade-exit-done + tr {
      display: none;
    }
  }
`;

export const TableHeaderCellText = styled.span`
  font-weight: 600;
`;

interface Props {
  type: ManagerType;
  sortAttribute?: SortAttribute;
  sortDirection?: SortDirection;
  posts?: IIdeaData[] | IInitiativeData[];
  phases?: IPhaseData[];
  statuses?: IIdeaStatusData[] | IInitiativeStatusData[];
  onChangeSort?: (sort: Sort) => void;
  selection: Set<string>;
  onChangeSelection: (newSelection: Set<string>) => void;
  currentPageNumber?: number;
  lastPageNumber?: number;
  onChangePage?: (number: number) => void;
  activeFilterMenu: TFilterMenu;
  handleSeeAll: () => void;
  openPreview: (ideaId: string) => void;
}

export default class IdeaTable extends React.Component<Props> {

  handleSortClick = (newSortAttribute: SortAttribute) => () => {
    const { sortAttribute: oldSortAttribute, sortDirection: oldSortDirection, onChangeSort } = this.props;
    if (isFunction(onChangeSort)) {
      let newSortSign = '-';
      if (newSortAttribute === oldSortAttribute) {
        newSortSign = oldSortDirection === 'ascending' ? '-' : '';
      }
      onChangeSort(`${newSortSign}${newSortAttribute}` as Sort);
    }
  }

  select = (postId: string) => () => {
    const { selection, onChangeSelection } = this.props;
    const newSelection = new Set(selection);
    newSelection.add(postId);
    onChangeSelection(newSelection);
  }

  unselect = (postId: string) => () => {
    const { selection, onChangeSelection } = this.props;
    const newSelection = new Set(selection);
    const success = newSelection.delete(postId);
    onChangeSelection(newSelection);
    return success;
  }

  toggleSelect = (postId: string) => () => {
    this.unselect(postId)() || this.select(postId)();
  }

  toggleSelectAll = () => {
    const { posts, onChangeSelection } = this.props;
    if (this.allSelected()) {
      onChangeSelection(new Set());
    } else {
      // TODO fix typings here, with the conditional type here, ts complains
      posts && onChangeSelection(new Set((posts as IIdeaData[]).map(post => post.id)));
    }
  }

  singleSelect = (postId: string) => () => {
    this.props.onChangeSelection(new Set([postId]));
  }

  clearSelection = () => () => {
    this.props.onChangeSelection(new Set());
  }

  handlePaginationClick = (page) => {
    this.props.onChangePage && this.props.onChangePage(page);
  }

  allSelected = () => {
    const { posts, selection } = this.props;
    return !isEmpty(posts) && every(posts, (post: IIdeaData | IInitiativeData) => selection.has(post.id));
  }

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
        <Table sortable size="small">
          {type === 'Initiatives'
            ? <InitiativesHeaderRow
              sortAttribute={sortAttribute}
              sortDirection={sortDirection}
              allSelected={this.allSelected()}
              toggleSelectAll={this.toggleSelectAll}
              handleSortClick={this.handleSortClick}
            />
            : <IdeaHeaderRow
              sortAttribute={sortAttribute}
              sortDirection={sortDirection}
              allSelected={this.allSelected()}
              toggleSelectAll={this.toggleSelectAll}
              handleSortClick={this.handleSortClick}
            />
          }
          <Table.Body>
            {!!posts && posts.length > 0 ?
              <TransitionGroup component={null}>
                {// TODO fix typings here, with the conditional type here, ts complains
                (posts as IIdeaData[]).map(post =>
                  <CSSTransition classNames="fade" timeout={500} key={post.id}>
                    <Row
                      className="e2e-post-manager-post-row"
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
                )}
              </TransitionGroup> : null
            }
          </Table.Body>
          {!!posts && posts.length > 0 &&
            <Table.Footer fullWidth={true}>
              <Table.Row>
                <Table.HeaderCell colSpan="7">
                  <Pagination
                    currentPage={this.props.currentPageNumber || 1}
                    totalPages={this.props.lastPageNumber || 1}
                    loadPage={this.handlePaginationClick}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          }
        </Table>
        <TransitionGroup component={null}>
          {!posts || posts.length === 0 &&
            <CSSTransition classNames="fade" timeout={500}>
              <NoPost handleSeeAll={handleSeeAll} type={type} />
            </CSSTransition>
          }
        </TransitionGroup>
      </Container>
    );
  }
}
