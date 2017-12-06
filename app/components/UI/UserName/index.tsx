import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { IUser } from 'services/users';

import messages from './messages';

interface Props {
  user: IUser | null;
}

const UserName: React.SFC<Props & InjectedIntlProps> = ({ user, intl: { formatMessage } }) => {
  const authorName = user ? `${user.data.attributes.first_name} ${user.data.attributes.last_name || ''}` : `<span class="deleted-user">${formatMessage(messages.deletedUser)}</span>`;
  return (
    <span dangerouslySetInnerHTML={{ __html: authorName }} />
  );
};

export default injectIntl<Props>(UserName);
