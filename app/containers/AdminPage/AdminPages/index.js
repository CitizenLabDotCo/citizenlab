import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { createStructuredSelector } from 'reselect';
import { Icon, Menu, Table } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { bindActionCreators } from 'redux';
import T from 'containers/T';
import { preprocess } from 'utils/reactRedux';
import { getFromState } from 'utils/immutables';
import { selectResourcesDomain } from 'utils/resources/selectors';
import WatchSagas from 'containers/WatchSagas';

import sagas from './sagas';
import {
  selectAdminPages,
} from './selectors';
import { loadPagesRequest } from './actions';
import messages from './messages';


class AdminPages extends React.Component { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    const { loadPagesRequest: lpr } = this.props;
    lpr(1, 5, null, true);
  }

  getPageTitle = (page) => () => page.getIn(['attributes', 'title_multiloc']);

  goToNextPage = () => {
    const { loadPagesRequest: lpr, nextPageNumber, nextPageItemCount, pageCount } = this.props;
    lpr(nextPageNumber, nextPageItemCount, pageCount, false);
  };

  goToPreviousPage = () => {
    const { loadPagesRequest: lpr, prevPageNumber, prevPageItemCount, pageCount } = this.props;
    lpr(prevPageNumber, prevPageItemCount, pageCount, false);
  };

  goToPage = (pageNumber) => () => {
    const { loadPagesRequest: lpr, currentPageItemCount, pageCount } = this.props;
    lpr(pageNumber, currentPageItemCount, pageCount, false);
  };

  render() {
    let table = null;
    const pageNumbers = [];
    const { pages, pageCount, loading, loadError, currentPageNumber } = this.props;

    for (let i = 1; i <= pageCount; i += 1) {
      pageNumbers.push(i);
    }

    if (loading) {
      table = <FormattedMessage {...messages.loading} />;
    } else if (loadError) {
      table = <FormattedMessage {...messages.loadError} />;
    } else if (pages && pages.size > 0) {
      table = (<Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              <FormattedMessage {...messages.page} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {pages.map((page, index) =>
            <Table.Row key={index}>
              <Table.Cell>
                <T value={this.getPageTitle(page)} />
              </Table.Cell>
            </Table.Row>)
          }
        </Table.Body>

        { (pageNumbers && pageNumbers.length > 1) ? (
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="4">
                <Menu floated="right" pagination>

                  <Menu.Item as="a" icon onClick={this.goToPreviousPage}>
                    <Icon name="left chevron" />
                  </Menu.Item>

                  {pageNumbers.map((pageNumber) =>
                    <Menu.Item
                      key={pageNumber}
                      active={pageNumber === currentPageNumber}
                      onClick={this.goToPage(pageNumber)}
                      as="a"
                    >{pageNumber}</Menu.Item>)
                  }

                  <Menu.Item as="a" icon onClick={this.goToNextPage}>
                    <Icon name="right chevron" />
                  </Menu.Item>

                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>) : null }
      </Table>);
    } else {
      table = <FormattedMessage {...messages.noPages} />;
    }

    return (
      <div>
        <WatchSagas sagas={sagas} />
        {table}
      </div>
    );
  }
}

AdminPages.propTypes = {
  pages: ImmutablePropTypes.list.isRequired,
  prevPageNumber: PropTypes.number,
  prevPageItemCount: PropTypes.number,
  currentPageNumber: PropTypes.number,
  currentPageItemCount: PropTypes.number,
  nextPageNumber: PropTypes.number,
  nextPageItemCount: PropTypes.number,
  pageCount: PropTypes.number,
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.bool.isRequired,
  loadPagesRequest: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectAdminPages,
  resourcesState: selectResourcesDomain(),
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({ loadPagesRequest }, dispatch);

const mergeProps = ({ pageState, resourcesState }, dispatchProps) => ({
  pages: getFromState(resourcesState, 'pages'),
  pagesIds: getFromState(pageState, 'pageIds'),
  prevPageNumber: getFromState(pageState, 'prevPageNumber'),
  prevPageItemCount: getFromState(pageState, 'prevPageItemCount'),
  currentPageNumber: getFromState(pageState, 'currentPageNumber'),
  currentPageItemCount: getFromState(pageState, 'currentPageItemCount'),
  nextPageNumber: getFromState(pageState, 'nextPageNumber'),
  nextPageItemCount: getFromState(pageState, 'nextPageItemCount'),
  pageCount: getFromState(pageState, 'pageCount'),
  loading: getFromState(pageState, 'loading'),
  loadError: getFromState(pageState, 'loadError'),
  ...dispatchProps,
});

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(AdminPages);
