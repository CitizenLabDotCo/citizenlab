import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { Button } from 'semantic-ui-react';
import { injectTFunc } from 'components/T/utils';
import { loadNextPage } from '../../actions';
import selectIdeasIndexPageDomain from '../../selectors';

import messages from '../../messages';

const Loadbutton = ({ loadMoreIdeas, loadMoreMessage, disabled }) => (
  <Button
    disabled={disabled}
    style={{ marginLeft: 0, marginRight: 0 }}
    fluid
    onClick={loadMoreIdeas}
  >
    <FormattedMessage {...loadMoreMessage} />
  </Button>
);

Loadbutton.propTypes = {
  loadMoreIdeas: PropTypes.func.isRequired,
  loadMoreMessage: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
};

const mapStateToProps = createStructuredSelector({
  nextPageNumber: selectIdeasIndexPageDomain('nextPageNumber'),
  nextPageItemCount: selectIdeasIndexPageDomain('nextPageItemCount'),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadNextPage }, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  loadMoreIdeas() {
    const getNextPage = dispatchProps.loadNextPage;
    const { nextPageNumber, nextPageItemCount } = stateProps;
    const search = ownProps.location.search;
    return getNextPage(nextPageNumber, nextPageItemCount, search);
  },
  loadMoreMessage: messages.loadMore,
  disabled: !(stateProps.nextPageNumber && stateProps.nextPageItemCount),
});

export default injectTFunc(withRouter(connect(mapStateToProps, mapDispatchToProps, mergeProps)(Loadbutton)));
