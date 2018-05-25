// Libraries
import React from 'react';
import { isString, isEmpty } from 'lodash';

// Components
import UserTable from './UserTable';
import AllUsersHeader from './AllUsersHeader';

interface Props {}

interface State {
  search: string | undefined;
}

export default class AllUsers extends React.PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      search: undefined
    };
  }

  searchUser = (searchTerm: string) => {
    this.setState({
      search: (isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '')
    });
  }

  render() {
    const { search } = this.state;

    return (
      <>
        <AllUsersHeader onSearch={this.searchUser} />
        <UserTable search={search}/>
      </>
    );
  }
}
