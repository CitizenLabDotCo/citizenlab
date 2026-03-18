import { FormatMessage } from 'typings';

import { IUserData } from 'api/users/types';

import blockUserMessages from 'components/admin/UserBlockModals/messages';
import { IAction } from 'components/UI/MoreActionsMenu';

import clHistory from 'utils/cl-router/history';
import { isAdmin, isRegularUser } from 'utils/permissions/roles';

import messages from '../../../../messages';

export type Action =
  | 'unblock-user'
  | 'block-user'
  | 'set-admin'
  | 'set-moderator'
  | 'set-normal-user'
  | 'delete-user';

interface Params {
  formatMessage: FormatMessage;
  user: IUserData;
  authUser: IUserData;
  isUserBlockingEnabled: boolean;
  onAction: (action: Action) => void;
}

export const getActions = ({
  formatMessage,
  user,
  authUser,
  isUserBlockingEnabled,
  onAction,
}: Params) => {
  const isUserInRowAdmin = isAdmin({ data: user });
  const isUserInRowModerator = !isRegularUser({ data: user });
  const userInRowHasRegistered = user.attributes.invite_status !== 'pending';
  const userInRowIsCurrentUser = user.id === authUser.id;
  const authUserIsAdmin = isAdmin({ data: authUser });

  const showProfileAction = {
    handler: () => {
      clHistory.push(`/profile/${user.attributes.slug}`);
    },
    label: formatMessage(messages.seeProfile),
    icon: 'eye' as const,
  };

  const userBlockingRelatedActions: IAction[] =
    isUserBlockingEnabled && !userInRowIsCurrentUser
      ? [
          user.attributes.blocked
            ? {
                handler: () => onAction('unblock-user'),
                label: formatMessage(blockUserMessages.unblockAction),
                icon: 'user-circle' as const,
              }
            : {
                handler: () => onAction('block-user'),
                label: formatMessage(blockUserMessages.blockAction),
                icon: 'halt' as const,
              },
        ]
      : [];

  const getSeatChangeActions = () => {
    const setAsAdminAction = {
      handler: () => onAction('set-admin'),
      label: formatMessage(messages.setAsAdmin),
      icon: 'shield-checkered' as const,
    };

    const setSetAsProjectModeratorAction = {
      handler: () => onAction('set-moderator'),
      label: formatMessage(messages.assignAsManager),
      icon: 'user-check' as const,
    };

    const setAsNormalUserAction = {
      handler: () => onAction('set-normal-user'),
      label: formatMessage(messages.setAsNormalUser),
      icon: 'user-circle' as const,
    };

    if (userInRowIsCurrentUser) {
      if (isUserInRowAdmin) {
        return [setSetAsProjectModeratorAction];
      }

      return [];
    }

    if (isUserInRowAdmin) {
      return [setAsNormalUserAction, setSetAsProjectModeratorAction];
    } else if (isUserInRowModerator) {
      return [
        setAsNormalUserAction,
        setAsAdminAction,
        setSetAsProjectModeratorAction,
      ];
    } else {
      return [setAsAdminAction, setSetAsProjectModeratorAction];
    }
  };

  const deleteUserAction = {
    handler: () => {
      if (userInRowIsCurrentUser) {
        window.alert(formatMessage(messages.youCantDeleteYourself));
      } else {
        onAction('delete-user');
      }
    },
    label: formatMessage(messages.deleteUser),
    icon: 'delete' as const,
  };

  if (userInRowHasRegistered) {
    return authUserIsAdmin
      ? [
          showProfileAction,
          ...getSeatChangeActions(),
          deleteUserAction,
          ...userBlockingRelatedActions,
        ]
      : [showProfileAction]; // Project/folder managers can only see profile
  }

  return authUserIsAdmin ? [deleteUserAction] : []; // Project/folder managers cannot delete anyone
};
