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
import { injectTFunc } from 'components/T/utils';
import messages from '../messages';

// Components
import Icon from 'components/UI/Icon';
import Input from 'components/UI/Input';

// parse search
import queryString from 'query-string';

const SearchButton = styled.button`
  background: none;
  border: none;
  margin: 0 0 0 -36px;
  padding: 0;
  z-index: 2;
`;

const SearchIcon: any = styled(Icon)`
  fill: #84939E;
  height: 21px;
  cursor: pointer;

  &:hover {
    fill: #000;
  }
`;

const SearchInput = styled(Input)``;

const StyledForm = styled.form`
  flex: 1 1 100%;
  display: flex;
  align-items: center;
  align-self: stretch;

  @media (min-width: 500px) {
    flex-basis: auto;

    ${SearchInput} {
      width: 100%;
      max-width: 300px;
    }
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

  handleSubmit = (event): void => {
    event.preventDefault();
    const { value } = this.state;
    this.props.filterPage('search', [value]);
  }

  handleChange = (value): void => {
    this.setState({ value });
  }

  render() {
    const { value } = this.state && this.state.value !== null ? this.state : this.props;

    return (
      <StyledForm onSubmit={this.handleSubmit}>
        <SearchInput
          type="text"
          placeholder="Search"
          onChange={this.handleChange}
          value={value}
          id="e2e-ideas-search"
        />
        <SearchButton className="e2e-ideas-search-button">
          <SearchIcon name="search" className="search-icon" />
        </SearchButton>
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
