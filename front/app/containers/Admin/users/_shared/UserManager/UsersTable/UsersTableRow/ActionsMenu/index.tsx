import React, { useState } from 'react';

import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';
import useUpdateUser from 'api/users/useUpdateUser';

import useExceedsSeats from 'hooks/useExceedsSeats';
import useFeatureFlag from 'hooks/useFeatureFlag';

import blockUserMessages from 'components/admin/UserBlockModals/messages';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isAdmin, isRegularUser } from 'utils/permissions/roles';

import messages from './messages';
import Modals from './Modals';
import { ModalName, Action } from './types';

interface Props {
  user: IUserData;
}

const ActionsMenu = ({ user }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const isUserBlockingEnabled = useFeatureFlag({
    name: 'user_blocking',
  });
  const [modalOpened, setModalOpened] = useState<ModalName | null>(null);
  const { mutate: updateUser } = useUpdateUser();
  const { checkIfUserExceedsSeats } = useExceedsSeats();

  if (!authUser) return null;

  const isUserInRowAdmin = isAdmin({ data: user });
  const isUserInRowModerator = !isRegularUser({ data: user });
  const userInRowHasRegistered = user.attributes.invite_status !== 'pending';
  const userInRowIsCurrentUser = user.id === authUser.data.id;
  const authUserIsAdmin = isAdmin(authUser);

  const handleMakeAdmin = () => {
    updateUser({
      userId: user.id,
      roles: [...(user.attributes.roles ?? []), { type: 'admin' }],
    });
  };

  const onAction = (action: Action) => {
    switch (action) {
      case 'block-user':
        setModalOpened('block-user');
        break;
      case 'unblock-user':
        setModalOpened('unblock-user');
        break;
      case 'delete-user':
        setModalOpened('delete-user');
        break;
      case 'set-admin':
        if (!checkIfUserExceedsSeats) return;

        if (checkIfUserExceedsSeats(user, 'admin')) {
          setModalOpened('seat-limit-reached');
        } else {
          handleMakeAdmin();
        }
        break;
      case 'set-moderator':
        setModalOpened('set-moderator');
        break;
      case 'set-normal-user':
        updateUser({
          userId: user.id,
          roles: [],
        });
        break;
      default:
        break;
    }
  };

  const getActions = () => {
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

  const actions = getActions();

  return (
    <>
      <MoreActionsMenu showLabel={false} actions={actions} />
      <Modals
        modalOpened={modalOpened}
        user={user}
        closeModal={() => setModalOpened(null)}
        onAcceptIncreasedSeatLimitForAdmin={handleMakeAdmin}
      />
    </>
  );
};

export default ActionsMenu;
