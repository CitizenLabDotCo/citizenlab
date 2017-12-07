import * as React from 'react';

import { FormattedMessage } from 'utils/cl-intl';
import { IUser } from 'services/users';

import messages from './messages';

interface Props {
  user: IUser | null;
}

const UserName: React.SFC<Props> = ({ user }) => {
  if (!user) {
    return (<span className="deleted-user"><FormattedMessage {...messages.deletedUser} /></span>);
  } else {
    return (<span>{`${user.data.attributes.first_name} ${user.data.attributes.last_name || ''}`}</span>);
  }
};

export default UserName;
