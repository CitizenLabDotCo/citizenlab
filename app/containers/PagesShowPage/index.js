/*
 *
 * PagesShowPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { preprocess } from 'utils/reactRedux';
import HelmetIntl from 'components/HelmetIntl';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import WatchSagas from 'containers/WatchSagas';
import { bindActionCreators } from 'redux';
import T from 'containers/T';

import selectPagesShowPage, { makeSelectPage } from './selectors';
import sagas from './sagas';
import messages from './messages';
import { loadPageRequest } from './actions';
import styled from 'styled-components';

export class PagesShowPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide context to bindings
    this.loadPage = this.loadPage.bind(this);
  }

  componentDidMount() {
    // not triggered on page refresh
    const { id } = this.props.params;

    this.loadPage(id);
  }

  loadPage(id) {
    this.props.loadPageRequest(id);
  }

  render() {
    const { loading, loadError, page, className } = this.props;

    return (
      <div className={className}>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <WatchSagas sagas={sagas} />
        {loading && <div><FormattedMessage {...messages.loading} /></div>}
        {loadError && <div>{loadError}</div>}

        {page && <div>
          <div>
            <h1><T value={page.attributes.title_multiloc} /></h1>
            <T value={page.attributes.body_multiloc} />
          </div>
        </div>}
      </div>
    );
  }
}

PagesShowPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.string,
  page: PropTypes.object,
  loadPageRequest: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  className: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectPagesShowPage,
  page: makeSelectPage(),
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadPageRequest,
}, dispatch);

const mergeProps = ({ pageState, page }, dispatchProps, { params }) => ({
  loading: pageState.get('loading'),
  loadError: pageState.get('loadError'),
  page: page && page.toJS(),
  params,
  ...dispatchProps,
});


export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(styled(PagesShowPage)`
  width: 80%;
  margin: auto;
`);
