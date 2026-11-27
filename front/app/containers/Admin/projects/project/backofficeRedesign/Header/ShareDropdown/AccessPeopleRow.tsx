import React from 'react';

import Avatar from 'design-system/Avatar';

import { IUserData } from 'api/users/types';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import styles from './ShareDropdown.module.css';
import 'design-system/tokens.css';

const getRoleMessage = (user: IUserData, isInvitePending: boolean) => {
  if (isInvitePending) return messages.shareRolePending;

  return isAdmin({ data: user })
    ? messages.shareRoleAdmin
    : messages.shareRoleManager;
};

interface Props {
  user: IUserData;
  isAuthUser: boolean;
}

const AccessPeopleRow = ({ user, isAuthUser }: Props) => {
  const { formatMessage } = useIntl();
  const { first_name, last_name, email, invite_status, avatar } =
    user.attributes;
  const isInvitePending = invite_status === 'pending';
  const name = [first_name, last_name].filter(Boolean).join(' ');
  const shownName = isInvitePending ? email : name;
  const avatarSrc = avatar?.small;

  const roleMessage = getRoleMessage(user, isInvitePending);

  return (
    <div className={styles.personRow}>
      {avatarSrc ? (
        // The name sits right next to the photo, so the photo needs no alt.
        <Avatar content="image" src={avatarSrc} alt="" />
      ) : (
        <Avatar
          initials={name
            .split(' ')
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join('')
            .toUpperCase()}
        />
      )}
      <div className={styles.personText}>
        <p className={styles.personName}>
          {shownName}
          {isAuthUser && (
            <span className={styles.you}>
              {formatMessage(messages.shareYou)}
            </span>
          )}
        </p>
        {!isInvitePending && email && <p className={styles.personEmail}>{email}</p>}
      </div>
      <span className={styles.role}>{formatMessage(roleMessage)}</span>
    </div>
  );
};

export default AccessPeopleRow;
