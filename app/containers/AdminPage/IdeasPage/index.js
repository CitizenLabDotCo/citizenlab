import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Saga } from 'react-redux-saga';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { Icon, Menu, Table } from 'semantic-ui-react';
import _ from 'lodash';
// import moment from 'moment';
// import { injectTFunc } from 'containers/T/utils';
// import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import {
  selectIdeasIds,
  selectIdeasLoading,
  selectIdeasLoadError,
  selectIdeasLoaded,
  selectFirstPageNumber,
  selectFirstPageItemCount,
  selectPrevPageNumber,
  selectPrevPageItemCount,
  selectCurrentPageNumber,
  selectCurrentPageItemCount,
  selectNextPageNumber,
  selectNextPageItemCount,
  selectLastPageNumber,
  selectLastPageItemCount,
  selectPageCount,
} from './selectors';
import { loadIdeas } from './actions';
import { watchLoadIdeas } from './sagas';
import IdeaTableRow from './components/ideaTableRow';


class IdeasPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.loadIdeas(1, 5, null, true);
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
    const { ideas, pageCount, loading, loadError, loaded, currentPageNumber } = this.props;

    for (let i = 1; i <= pageCount; i += 1) {
      pageNumbersArray.push(i);
    }

    if (loading) {
      table = <div>Loading...</div>;
    } else if (loadError) {
      table = <div>An error occured</div>;
    } else if (loaded && ideas && ideas.size > 0) {
      table = (<Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Title</Table.HeaderCell>
            <Table.HeaderCell>Posted at</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {ideas.map((idea) => <IdeaTableRow key={idea} id={idea} />)}
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
        <Helmet
          title="Ideas admin page"
          meta={[
            { name: 'description', content: 'List of ideas in admin backoffice' },
          ]}
        />
        <h1>Ideas</h1>
        <Saga saga={watchLoadIdeas} />
        {table}
      </div>
    );
  }
}

IdeasPage.propTypes = {
  ideas: ImmutablePropTypes.list.isRequired,
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.bool.isRequired,
  loaded: PropTypes.bool.isRequired,
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
  loadIdeas: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  // locale: makeSelectLocale(),
  ideas: selectIdeasIds,
  loading: selectIdeasLoading,
  loadError: selectIdeasLoadError,
  loaded: selectIdeasLoaded,
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
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadIdeas }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(IdeasPage);
