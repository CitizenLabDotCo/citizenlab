// Libraries
import { isEmpty, isString } from 'lodash-es';
import React, { PureComponent } from 'react';

// Components
import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

// Styles
import styled from 'styled-components';

const Container = styled.div``;

interface Props {}

interface State {
  search: string | undefined;
}

export default class AllUsers extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      search: undefined,
    };
  }

  searchUser = (searchTerm: string) => {
    this.setState({
      search: isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '',
    });
  };

  render() {
    const { search } = this.state;

    return (
      <Container>
        <UsersHeader onSearch={this.searchUser} />
        <UserManager search={search} />
      </Container>
    );
  }
}
