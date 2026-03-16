import { FormatMessage } from 'typings';

import { IUserData } from 'api/users/types';

import blockUserMessages from 'components/admin/UserBlockModals/messages';
import { IAction } from 'components/UI/MoreActionsMenu';

import clHistory from 'utils/cl-router/history';
import { isAdmin, isRegularUser } from 'utils/permissions/roles';

import messages from '../../../../messages';

interface Params {
  formatMessage: FormatMessage;
  user: IUserData;
  authUser: IUserData;
  isUserBlockingEnabled: boolean;
  setShowUnblockUserModal: (value: boolean) => void;
  setShowBlockUserModal: (value: boolean) => void;
  setShowDeleteUserModal: (value: boolean) => void;
  setIsSetSetAsProjectModeratorOpened: (value: boolean) => void;
  changeRoleHandler: (role: string) => void;
}

export const getActions = ({
  formatMessage,
  user,
  authUser,
  isUserBlockingEnabled,
  setShowUnblockUserModal,
  setShowBlockUserModal,
  setShowDeleteUserModal,
  setIsSetSetAsProjectModeratorOpened,
  changeRoleHandler,
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
                handler: () => setShowUnblockUserModal(true),
                label: formatMessage(blockUserMessages.unblockAction),
                icon: 'user-circle' as const,
              }
            : {
                handler: () => setShowBlockUserModal(true),
                label: formatMessage(blockUserMessages.blockAction),
                icon: 'halt' as const,
              },
        ]
      : [];

  const getSeatChangeActions = () => {
    const setAsAdminAction = {
      handler: () => {
        changeRoleHandler('admin');
      },
      label: formatMessage(messages.setAsAdmin),
      icon: 'shield-checkered' as const,
    };

    const setSetAsProjectModeratorAction = {
      handler: () => {
        setIsSetSetAsProjectModeratorOpened(true);
      },
      label: formatMessage(messages.assignAsManager),
      icon: 'user-check' as const,
    };

    const setAsNormalUserAction = {
      handler: () => {
        changeRoleHandler('user');
      },
      label: formatMessage(messages.setAsNormalUser),
      icon: 'user-circle' as const,
    };

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
        // eventEmitter.emit<JSX.Element>(
        //   events.userDeletionFailed,
        //   <FormattedMessage { ...messages.youCantDeleteYourself } />
        // );
      } else {
        setShowDeleteUserModal(true);
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
