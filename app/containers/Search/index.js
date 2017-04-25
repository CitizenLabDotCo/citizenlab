/*
 *
 * Search
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Saga } from 'react-redux-saga';
import { createStructuredSelector } from 'reselect';

// import { makeSelectIsLoadingFilteredIdeas } from './selectors';
import { watchSearchIdeasRequest } from './sagas';
import { searchIdeasRequest } from './actions';
import { makeSelectIsLoadingFilteredIdeas } from './selectors';

export class Search extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  searchIdeas(event, value) {
    this.props.searchIdeas(value);
  }

  render() {
    const { isLoadingFilteredIdeas } = this.props;

    return (
      <div>
        <Saga saga={watchSearchIdeasRequest} />
        <Search
          loading={isLoadingFilteredIdeas}
          onSearchChange={this.searchIdeas}
        />
      </div>
    );
  }
}

Search.propTypes = {
  isLoadingFilteredIdeas: PropTypes.bool.isRequired,
  searchIdeas: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  isLoadingFilteredIdeas: makeSelectIsLoadingFilteredIdeas(),
});

export function mapDispatchToProps(dispatch) {
  return {
    searchIdeas: (filterString) => {
      dispatch(searchIdeasRequest(filterString));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);
