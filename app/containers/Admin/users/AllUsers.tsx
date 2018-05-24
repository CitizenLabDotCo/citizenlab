// Libraries
import React from 'react';

// Components
import UserTable from './UserTable';
import AllUsersHeader from './AllUsersHeader';

interface Props {}

interface State {}

export default class AllUsers extends React.PureComponent<Props, State> {

  searchUser = (searchTerm: string) => {
    // TODO: wire up the search with the Users Table query
    console.log(searchTerm);
  }

  render() {
    return (
      <>
        <AllUsersHeader onSearch={this.searchUser} />
        <UserTable />
      </>
    );
  }
}
