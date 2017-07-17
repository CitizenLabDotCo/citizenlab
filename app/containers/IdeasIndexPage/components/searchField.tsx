// Libraries
import * as React from 'react';
import styledComponents from 'styled-components';
import { connect } from 'react-redux';
const styled = styledComponents;

// store
import { push } from 'react-router-redux';
import { selectResourcesDomain } from 'utils/resources/selectors';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';

// translations
import { injectTFunc } from 'containers/T/utils';

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

type Props = {
  filterPage: Function,
};

class SearchField extends React.Component<Props> {
  handleSubmit = (event):void => {
    event.preventDefault();
    const value = event.target.search.value;
    this.props.filterPage('search', [value]);
  }

  render() {
    return (
      <StyledForm onSubmit={this.handleSubmit}>
        <input name="search" type="text" placeholder="Search"/>
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
  const { areas, search, location } = stateProps;
  if (!areas) return {};

  const { tFunc } = ownProps;

  const options = areas.reactMap((element) => {
    const value = element.get('id');
    const text = tFunc(element.getIn(['attributes', 'title_multiloc']));
    return { text, value };
  });
  const { goTo } = dispatchProps;

  const value = queryString.parse(search, { arrayFormat: 'index' }).search;

  const filterPage = (name, ids) => {
    goTo(`${location}?${mergeQuery(search, name, ids)}`);
  };

  return { options, value, filterPage, ...ownProps };
};

export default injectTFunc(connect(mapStateToProps, { goTo: push }, mergeProps)(SearchField));
