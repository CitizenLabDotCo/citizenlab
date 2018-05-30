// Libraries
import React from 'react';
import { isString, isEmpty } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';

// Components
import UserTable from './UserTable';
import AllUsersHeader from './AllUsersHeader';

// Resources
import GetUserCount, { GetUserCountChildProps } from 'resources/GetUserCount';

interface InputProps {}

interface DataProps {
  usercount: GetUserCountChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  search: string | undefined;
}

class AllUsers extends React.PureComponent<Props, State> {

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
    const { usercount } = this.props;
    const { search } = this.state;

    if (!isNilOrError(usercount)) {
      return (
        <>
          <AllUsersHeader onSearch={this.searchUser} />
          <UserTable search={search} usercount={usercount}/>
        </>
      );
    }

    return null;
  }
}

export default () => (
  <GetUserCount>
    {usercount =>  <AllUsers usercount={usercount} />}
  </GetUserCount>
);
