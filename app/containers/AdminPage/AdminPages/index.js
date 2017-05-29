import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { Grid, Icon, Menu, Table } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { bindActionCreators } from 'redux';
import T from 'containers/T';
import { preprocess } from 'utils/reactRedux';
import WatchSagas from 'containers/WatchSagas';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from 'styled-components';
import { push } from 'react-router-redux';

import Sidebar from './../SideBar/';
import sagas from './sagas';
import {
  makeSelectPages,
  selectAdminPages,
} from './selectors';
import { loadPagesRequest } from './actions';
import messages from './messages';

const Wrapper = styled.div`
  padding-top: 100px;
`;

class AdminPages extends React.Component { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    const { loadPagesRequest: lpr } = this.props;
    lpr(1, 5, null);
  }

  getPageTitle = (page) => page.attributes.title_multiloc;

  goToNextPage = () => {
    const { nextPageNumber, nextPageItemCount, pageCount, currentPageNumber: pageNumber } = this.props;

    if (!this.isLastPage(pageNumber, pageCount)) {
      this.props.loadPagesRequest(nextPageNumber, nextPageItemCount, pageCount);
    }
  };

  goToPreviousPage = () => {
    const { prevPageNumber, prevPageItemCount, pageCount, currentPageNumber: pageNumber } = this.props;

    if (!this.isFirstPage(pageNumber)) {
      this.props.loadPagesRequest(prevPageNumber, prevPageItemCount, pageCount);
    }
  };

  goToPage = (pageNumber) => () => {
    const { currentPageItemCount, pageCount } = this.props;
    this.props.loadPagesRequest(pageNumber, currentPageItemCount, pageCount);
  };

  routeToPage = (page) => {
    this.props.routeToPage(page.id);
  };

  isFirstPage = (pageNumber) => (pageNumber === 1);

  isLastPage = (pageNumber, pageCount) => (pageNumber === pageCount);

  render() {
    let table = null;
    const pageNumbers = [];
    const { pages, pageCount, loading, loadError, currentPageNumber, location } = this.props;

    for (let i = 1; i <= pageCount; i += 1) {
      pageNumbers.push(i);
    }

    if (loading) {
      table = <FormattedMessage {...messages.loading} />;
    } else if (loadError) {
      table = <FormattedMessage {...messages.loadError} />;
    } else if (pages && pages.size > 0) {
      const pagesJS = pages.toJS();
      table = (<Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              <FormattedMessage {...messages.page} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {Object.keys(pagesJS).map((page, index) => (<Table.Row key={index}>
            <Table.Cell>
              <T value={this.getPageTitle(pagesJS[page])} />
            </Table.Cell>
            <Table.Cell>
              <Icon
                style={{ cursor: 'pointer' }}
                name="arrow right"
                onClick={() => this.routeToPage(pagesJS[page])}
              />
            </Table.Cell>
          </Table.Row>))}
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
        <Helmet
          title="Admin pages"
          meta={[
            { name: 'description', content: 'List of pages published on the platform by admin' },
          ]}
        />
        <Wrapper>
          <Grid stackable>
            <Grid.Row>
              <Grid.Column width={3}>
                <Sidebar location={location} />
              </Grid.Column>
              <Grid.Column width={10}>
                {table}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Wrapper>
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
  location: PropTypes.object.isRequired,
  routeToPage: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectAdminPages,
  pages: makeSelectPages(),
});

const customActionCreators = {
  routeToPage(pageId) {
    return push(`/pages/${pageId}`);
  },
};

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadPagesRequest,
  ...customActionCreators,
}, dispatch);

const mergeProps = ({ pageState, pages }, dispatchProps, { location }) => ({
  pagesIds: pageState.get('pageIds'),
  prevPageNumber: pageState.get('prevPageNumber'),
  prevPageItemCount: pageState.get('prevPageItemCount'),
  currentPageNumber: pageState.get('currentPageNumber'),
  currentPageItemCount: pageState.get('currentPageItemCount'),
  nextPageNumber: pageState.get('nextPageNumber'),
  nextPageItemCount: pageState.get('nextPageItemCount'),
  pageCount: pageState.get('pageCount'),
  loading: pageState.get('loading'),
  loadError: pageState.get('loadError'),
  pages,
  location,
  ...dispatchProps,
});

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(AdminPages);
