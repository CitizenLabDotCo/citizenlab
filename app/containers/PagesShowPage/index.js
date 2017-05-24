/*
 *
 * PagesShowPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { preprocess } from 'utils/reactRedux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import WatchSagas from 'containers/WatchSagas';
import { bindActionCreators } from 'redux';
import T from 'containers/T';

import selectPagesShowPage, { makeSelectPage } from './selectors';
import sagas from './sagas';
import messages from './messages';
import { loadPageRequest } from './actions';

export class PagesShowPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    const { id } = this.props.params;

    this.props.loadPageRequest(id);
  }

  render() {
    const { loading, loadError, page } = this.props;

    return (
      <div>
        <Helmet
          title="PagesShowPage"
          meta={[
            { name: 'description', content: 'Displays page created by admin' },
          ]}
        />
        <WatchSagas sagas={sagas} />
        {page && <div>
          <FormattedMessage {...messages.header} /> {page.id}
        </div>}

        {loading && <div><FormattedMessage {...messages.loading} /></div>}
        {loadError && <div>{loadError}</div>}

        {page && <div>
          <div><T value={page.attributes.body_multiloc} /></div>
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


export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(PagesShowPage);
