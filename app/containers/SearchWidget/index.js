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
import { push } from 'react-router-redux';
import { injectIntl, intlShape } from 'react-intl';

import { watchSearchIdeasRequest } from './sagas';
import { searchIdeasRequest } from './actions';
import { makeSelectIsLoadingFilteredIdeas, makeSelectSearchResults } from './selectors';
import messages from './messages';
import IdeasSearchResult from './IdeasSearchResult';

export class SearchWidget extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide 'this' context to callbacks
    this.searchIdeas = this.searchIdeas.bind(this);
    this.handleResultSelect = this.handleResultSelect.bind(this);
  }

  searchIdeas(event, value) {
    this.props.searchIdeas(value);
  }

  handleResultSelect(event, values) {
    this.props.goToIdea(values.ideaId);
  }

  render() {
    const { isLoadingFilteredIdeas, searchResults } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <div>
        <Saga saga={watchSearchIdeasRequest} />
        <Search
          loading={isLoadingFilteredIdeas}
          // searchResults it's an immutable when returned from a selector but then it becomes an object
          results={searchResults}
          resultRenderer={IdeasSearchResult}
          onResultSelect={this.handleResultSelect}
          onSearchChange={this.searchIdeas}
          noResultsMessage={formatMessage(messages.noResultsMessage)}
        />
      </div>
    );
  }
}

SearchWidget.propTypes = {
  isLoadingFilteredIdeas: PropTypes.bool.isRequired,
  searchIdeas: PropTypes.func.isRequired,
  searchResults: PropTypes.any.isRequired,
  intl: intlShape.isRequired,
  goToIdea: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  isLoadingFilteredIdeas: makeSelectIsLoadingFilteredIdeas(),
  searchResults: makeSelectSearchResults(),
});

export function mapDispatchToProps(dispatch) {
  return {
    searchIdeas: (filterString) => {
      dispatch(searchIdeasRequest(filterString));
    },
    goToIdea: (ideaId) => {
      dispatch(push(`/ideas/${ideaId}`));
    },
  };
}
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SearchWidget));
