// Libraries
import React from 'react';
import { isString, isEmpty } from 'lodash';

// Components
import UserManager from './UserManager';
import AllUsersHeader from './AllUsersHeader';


interface InputProps { }


interface Props extends InputProps { }

interface State {
  search: string | undefined;
}


export default class AllUsers extends React.PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      search: undefined,
    };
  }

  searchUser = (searchTerm: string) => {
    this.setState({
      search: (isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '')
    });
  }

  render() {
    const { search } = this.state;

    console.log(this.state);

    return (
      <>
        <AllUsersHeader onSearch={this.searchUser} />

          <UserManager
            search={search}
          />
      </>
    );
  }
}
