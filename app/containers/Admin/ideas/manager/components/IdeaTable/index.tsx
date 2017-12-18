import * as React from 'react';
import * as _ from 'lodash';

import { IIdeaData } from 'services/ideas';
import { IPhaseData } from 'services/phases';

// Components
import { Table } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';
import SortableTableHeader from 'components/admin/SortableTableHeader';
import Row from './Row';
import Pagination from 'components/admin/Pagination';


import messages from '../../messages';

interface Props {
  ideaSortAttribute?: string;
  ideaSortDirection?: 'asc' | 'desc';
  ideas?: IIdeaData[];
  phases?: IPhaseData[];
  onChangeIdeaSortDirection?: (direction: 'asc' | 'desc') => void;
  onChangeIdeaSortAttribute?: (string) => void;
  selectedIdeas: { [key: string]: boolean };
  onChangeIdeaSelection: (selection: { [key: string]: boolean }) => void;
  ideaCurrentPageNumber?: number;
  ideaLastPageNumber?: number;
  onIdeaChangePage?: (number) => void;
  filterMode: string;
}

interface State {

}


export default class IdeaTable extends React.Component<Props, State> {

  handleSortClick = (attribute) => () => {
    let newDirection: 'asc' | 'desc' = 'desc';
    if (this.props.ideaSortAttribute === attribute) {
      newDirection = this.props.ideaSortDirection === 'asc' ? 'desc' : 'asc';
    }
    this.props.onChangeIdeaSortAttribute && this.props.onChangeIdeaSortAttribute(attribute);
    this.props.onChangeIdeaSortDirection && this.props.onChangeIdeaSortDirection(newDirection);
  }
  selectIdea = (idea) => () => {
    const selectedIdeas = _.clone(this.props.selectedIdeas);
    selectedIdeas[idea.id] = true;
    this.props.onChangeIdeaSelection(selectedIdeas);
  }

  unselectIdea = (idea) => () => {
    const selectedIdeas = _.omit(this.props.selectedIdeas, [idea.id]);
    this.props.onChangeIdeaSelection(selectedIdeas);
  }

  toggleSelectIdea = (idea) => () => {
    if (this.props.selectedIdeas[idea.id]) {
      this.unselectIdea(idea)();
    } else {
      this.selectIdea(idea)();
    }
  }

  singleSelectIdea = (idea) => () => {
    this.props.onChangeIdeaSelection({ [idea.id]: true });
  }

  clearIdeaSelection = () => () => {
    this.props.onChangeIdeaSelection({});
  }

  handlePaginationClick = (page) => {
    this.props.onIdeaChangePage && this.props.onIdeaChangePage(page);
  }

  render() {
    const { ideaSortAttribute, ideaSortDirection, ideas, selectedIdeas, phases, filterMode } = this.props;

    return(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={1} />
            <Table.HeaderCell width={4}>
              <FormattedMessage {...messages.title} />
            </Table.HeaderCell>
            <Table.HeaderCell width={2}>
              <SortableTableHeader
                direction={ideaSortAttribute === 'author_name' ? ideaSortDirection : null}
                onToggle={this.handleSortClick('author_name')}
              >
                <FormattedMessage {...messages.author} />
              </SortableTableHeader>
            </Table.HeaderCell>
            <Table.HeaderCell width={2}>
              <SortableTableHeader
                direction={ideaSortAttribute === 'new' ? ideaSortDirection : null}
                onToggle={this.handleSortClick('new')}
              >
                <FormattedMessage {...messages.publication_date} />
              </SortableTableHeader>
            </Table.HeaderCell>
            <Table.HeaderCell width={1}>
              <SortableTableHeader
                direction={ideaSortAttribute === 'upvotes_count' ? ideaSortDirection : null}
                onToggle={this.handleSortClick('upvotes_count')}
              >
                <FormattedMessage {...messages.up} />
              </SortableTableHeader>
            </Table.HeaderCell >
            <Table.HeaderCell width={1}>
              <SortableTableHeader
                direction={ideaSortAttribute === 'downvotes_count' ? ideaSortDirection : null}
                onToggle={this.handleSortClick('downvotes_count')}
              >
                <FormattedMessage {...messages.down} />
              </SortableTableHeader>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(ideas || []).map((idea) =>
            <Row
              key={idea.id}
              idea={idea}
              phases={phases}
              onSelectIdea={this.selectIdea(idea)}
              onUnselectIdea={this.unselectIdea(idea)}
              onToggleSelectIdea={this.toggleSelectIdea(idea)}
              onSingleSelectIdea={this.singleSelectIdea(idea)}
              selected={selectedIdeas[idea.id]}
              filterMode={filterMode}
            />
          )}
        </Table.Body>
        <Table.Footer fullWidth={true}>
          <Table.Row>
            <Table.HeaderCell colSpan="7">
              <Pagination
                currentPage={this.props.ideaCurrentPageNumber || 1}
                totalPages={this.props.ideaLastPageNumber || 1}
                loadPage={this.handlePaginationClick}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}
