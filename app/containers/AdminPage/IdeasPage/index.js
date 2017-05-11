import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Saga } from 'react-redux-saga';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { Icon, Menu, Table } from 'semantic-ui-react';
import _ from 'lodash';
import moment from 'moment';
import { injectTFunc } from 'containers/T/utils';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import {
  selectFirstPageNumber,
  selectFirstPageItemCount,
  selectPrevPageNumber,
  selectPrevPageItemCount,
  selectCurrentPageNumber,
  selectCurrentPageItemCount,
  selectNextPageNumber,
  selectNextPageItemCount,
  selectPageCount,
  selectLastPageNumber,
  selectLastPageItemCount,
  makeSelectLoading,
  makeSelectLoadError,
  makeselectPaginatedIdeas,
} from './selectors';
import { loadIdeas, loadTopics, loadAreas } from './actions';
import { watchLoadIdeas, watchLoadTopics, watchLoadAreas } from './sagas';


class IdeasPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.loadIdeas(1, 5, null, true);
    this.props.loadTopics();
    this.props.loadAreas();
  }


  goToPreviousIdeas = () => {
    const { prevPageNumber, prevPageItemCount, lastPageNumber, lastPageItemCount, pageCount } = this.props;

    if (_.isNumber(prevPageNumber) && prevPageNumber >= 1) {
      this.props.loadIdeas(prevPageNumber, prevPageItemCount, pageCount);
    } else {
      this.props.loadIdeas(lastPageNumber, lastPageItemCount, pageCount);
    }
  }


  goToNextIdeas = () => {
    const { firstPageNumber, firstPageItemCount, nextPageNumber, nextPageItemCount, pageCount } = this.props;

    if (_.isNumber(nextPageNumber) && nextPageNumber <= pageCount) {
      this.props.loadIdeas(nextPageNumber, nextPageItemCount, pageCount);
    } else {
      this.props.loadIdeas(firstPageNumber, firstPageItemCount, pageCount);
    }
  }


  goToIdeas = (pageNumber) => () => {
    const { currentPageItemCount, pageCount } = this.props;
    this.props.loadIdeas(pageNumber, currentPageItemCount, pageCount);
  }


  render() {
    let table = null;
    const pageNumbersArray = [];
    const { locale, tFunc, ideas, pageCount, loading, loadError, currentPageNumber } = this.props;

    for (let i = 1; i <= pageCount; i += 1) {
      pageNumbersArray.push(i);
    }

    if (loading) {
      table = <div>Loading...</div>;
    } else if (loadError) {
      table = <div>An error occured</div>;
    } else if (ideas && ideas.size > 0) {
      table = (<Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Title</Table.HeaderCell>
            <Table.HeaderCell>Posted at</Table.HeaderCell>
            <Table.HeaderCell>Author</Table.HeaderCell>
            <Table.HeaderCell>Categories</Table.HeaderCell>
            <Table.HeaderCell>Neighbourhoods</Table.HeaderCell>
            <Table.HeaderCell>Views</Table.HeaderCell>
            <Table.HeaderCell>Engagement</Table.HeaderCell>
            <Table.HeaderCell>Pro</Table.HeaderCell>
            <Table.HeaderCell>Contra</Table.HeaderCell>
            <Table.HeaderCell>Comments</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {ideas.map((idea) =>
            <Table.Row key={idea.get('id')}>
              <Table.Cell>{tFunc(idea.getIn(['attributes', 'title_multiloc']).toJS())}</Table.Cell>
              <Table.Cell>{moment(idea.getIn(['attributes', 'created_at'])).locale(locale).format('MMM Do YYYY')}</Table.Cell>
              <Table.Cell>{idea.getIn(['attributes', 'author_name'])}</Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
            </Table.Row>)
          }
        </Table.Body>

        { (pageNumbersArray && pageNumbersArray.length > 1) ? (
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="4">
                <Menu floated="right" pagination>

                  <Menu.Item as="a" icon onClick={this.goToPreviousIdeas}>
                    <Icon name="left chevron" />
                  </Menu.Item>

                  {pageNumbersArray.map((pageNumber) =>
                    <Menu.Item
                      key={pageNumber}
                      active={pageNumber === currentPageNumber}
                      onClick={this.goToIdeas(pageNumber)}
                      as="a"
                    >{pageNumber}</Menu.Item>)
                  }

                  <Menu.Item as="a" icon onClick={this.goToNextIdeas}>
                    <Icon name="right chevron" />
                  </Menu.Item>

                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>) : null }
      </Table>);
    } else {
      table = <div>No ideas</div>;
    }

    return (
      <div>
        <h1>Ideas</h1>
        <Saga saga={watchLoadIdeas} />
        <Saga saga={watchLoadTopics} />
        <Saga saga={watchLoadAreas} />
        {table}
      </div>
    );
  }
}

IdeasPage.propTypes = {
  locale: PropTypes.any,
  tFunc: PropTypes.func,
  ideas: ImmutablePropTypes.list.isRequired,
  firstPageNumber: PropTypes.number,
  firstPageItemCount: PropTypes.number,
  prevPageNumber: PropTypes.number,
  prevPageItemCount: PropTypes.number,
  currentPageNumber: PropTypes.number,
  currentPageItemCount: PropTypes.number,
  nextPageNumber: PropTypes.number,
  nextPageItemCount: PropTypes.number,
  lastPageNumber: PropTypes.number,
  lastPageItemCount: PropTypes.number,
  pageCount: PropTypes.number,
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.bool.isRequired,
  loadIdeas: PropTypes.func.isRequired,
  loadTopics: PropTypes.func.isRequired,
  loadAreas: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
  firstPageNumber: selectFirstPageNumber,
  firstPageItemCount: selectFirstPageItemCount,
  prevPageNumber: selectPrevPageNumber,
  prevPageItemCount: selectPrevPageItemCount,
  currentPageNumber: selectCurrentPageNumber,
  currentPageItemCount: selectCurrentPageItemCount,
  nextPageNumber: selectNextPageNumber,
  nextPageItemCount: selectNextPageItemCount,
  lastPageNumber: selectLastPageNumber,
  lastPageItemCount: selectLastPageItemCount,
  pageCount: selectPageCount,
  loading: makeSelectLoading(),
  loadError: makeSelectLoadError(),
  ideas: makeselectPaginatedIdeas(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadIdeas, loadTopics, loadAreas }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(injectTFunc(IdeasPage));
