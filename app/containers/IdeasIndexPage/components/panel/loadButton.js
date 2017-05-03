import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { Button } from 'semantic-ui-react';
import { injectTFunc } from 'containers/T/utils';
import { loadNextPage } from '../../actions';
import selectIdeasIndexPageDomain from '../../selectors';

import messages from '../../messages';

const Loadbutton = ({ loadMoreIdeas, loadMoreMessage }) => {
  return (
      <Button
        style={{ marginLeft: 0, marginRight: 0}}
        content={loadMoreMessage}
        fluid
        onClick={loadMoreIdeas}
      />
  );
};

Loadbutton.propTypes = {
  loadNextPage: PropTypes.func,
  nextPageNumber: PropTypes.number,
  nextPageItemCount: PropTypes.number,
};

const mapStateToProps = createStructuredSelector({
  nextPageNumber: selectIdeasIndexPageDomain('nextPageNumber'),
  nextPageItemCount: selectIdeasIndexPageDomain('nextPageItemCount'),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadNextPage }, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  loadMoreIdeas() {
    const dispatchloadNextPage = dispatchProps.loadNextPage;
    const { nextPageNumber, nextPageItemCount } = stateProps;
    return dispatchloadNextPage(nextPageNumber, nextPageItemCount);
  },
  ...ownProps,
  loadMoreMessage: ownProps.tFunc(messages.loadMore)
});

export default injectTFunc(connect(mapStateToProps, mapDispatchToProps, mergeProps)(Loadbutton));
