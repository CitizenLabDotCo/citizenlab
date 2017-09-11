// Libraries
import * as React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

// store
import { push } from 'react-router-redux';
import { selectResourcesDomain } from 'utils/resources/selectors';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';

// translations
import { injectIntl, InjectedIntl } from 'react-intl';
import { injectTFunc } from 'containers/T/utils';
import messages from '../messages';

// parse search
import queryString from 'query-string';

// style
const StyledForm = styled.form`
  align-self: stretch;
  flex:1;

  input {
    background: #fff;
    border-radius: 5px;
    height: 100%;
    padding: 1rem 1.5rem;
  }
`;

interface Props {
  filterPage: Function;
  value: string;
  intl: InjectedIntl;
}

type State = {
  value: string,
};

class SearchField extends React.Component<Props, State> {
  searchPlaceholder: string;

  componentWillMount() {
    this.searchPlaceholder = this.props.intl.formatMessage(messages.searchPlaceholder);
  }

  handleSubmit = (event):void => {
    event.preventDefault();
    const value = event.target.search.value;
    this.props.filterPage('search', [value]);
  }

  handleChange = (event):void => {
    this.setState({ value: event.target.value });
  }

  render() {
    const { value } = this.state && this.state.value !== null ? this.state : this.props;

    return (
      <StyledForm onSubmit={this.handleSubmit}>
        <input
          name="search"
          type="text"
          placeholder="Search"
          onChange={this.handleChange}
          value={value}
        />
      </StyledForm>
    );
  }
}

const mapStateToProps = () => createStructuredSelector({
  search: (state) => state.getIn(['route', 'locationBeforeTransitions', 'search']),
  location: (state) => state.getIn(['route', 'locationBeforeTransitions', 'pathname']),
});

const mergeQuery = (search, type, ids) => {
  const query = queryString.parse(search);
  query[type] = ids;
  return queryString.stringify(query);
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { search, location } = stateProps;
  const { tFunc } = ownProps;
  const { goTo } = dispatchProps;
  const value = queryString.parse(search).search;

  const filterPage = (name, ids) => {
    goTo(`${location}?${mergeQuery(search, name, ids)}`);
  };

  return { value, filterPage, ...ownProps };
};

export default injectIntl(injectTFunc(connect(mapStateToProps, { goTo: push }, mergeProps)(SearchField)));
