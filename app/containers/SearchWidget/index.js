/*
 *
 * SearchWidget
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Saga } from 'react-redux-saga';
import { createStructuredSelector } from 'reselect';
import { Search } from 'semantic-ui-react';

// import { makeSelectIsLoadingFilteredIdeas } from './selectors';
import { watchSearchIdeasRequest } from './sagas';
import { searchIdeasRequest } from './actions';
import { makeSelectIsLoadingFilteredIdeas } from './selectors';

export class SearchWidget extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide 'this' context to callbacks
    this.searchIdeas = this.searchIdeas.bind(this);
  }

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

SearchWidget.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(SearchWidget);
