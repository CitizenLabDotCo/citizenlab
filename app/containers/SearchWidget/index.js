/*
 *
 * SearchWidget
 *
 */

import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { connect } from 'react-redux';
import { Saga } from 'utils/react-redux-saga';
import { push } from 'react-router-redux';
import { createStructuredSelector } from 'reselect';
import { Search } from 'semantic-ui-react';
import _ from 'lodash';

import { searchIdeasRequest } from './actions';
import IdeasSearchResult from './IdeasSearchResult';
import messages from './messages';
import { watchSearchIdeasRequest } from './sagas';
import { makeSelectIsLoadingFilteredIdeas, makeSelectSearchResults } from './selectors';

export class SearchWidget extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide 'this' context to callbacks
    this.searchIdeas = this.searchIdeas.bind(this);
    this.handleResultSelect = this.handleResultSelect.bind(this);

    this.state = {
      // need to prevent errors on route changes
      searchValue: '',
      debouncing: false,
    };

    this.debounceSearch = _.debounce(this.dispatchSearchIdeas, 500, {
      traling: true,
      leading: false,
    });
  }

  dispatchSearchIdeas(value) {
    this.setState({
      debouncing: false,
    });
    this.props.searchIdeas(value);
  }

  searchIdeas(event, value) {
    this.setState({
      searchValue: value,
      debouncing: true,
    });

    this.debounceSearch(value);
  }

  handleResultSelect(event, values) {
    this.props.goToIdea(values.ideaId);
  }

  render() {
    const { isLoadingFilteredIdeas, searchResults } = this.props;
    const { searchValue, debouncing } = this.state;
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
          noResultsMessage={debouncing
            ? formatMessage(messages.waitingForInput)
            : formatMessage(messages.noResultsMessage)
          }
          value={searchValue}
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
