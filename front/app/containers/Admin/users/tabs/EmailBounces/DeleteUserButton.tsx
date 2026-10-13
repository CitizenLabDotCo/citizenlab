import React, { useState } from 'react';

import { IconButton, colors } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';

import UserDeleteModal from 'components/admin/UserDeleteModal';
import actionsMenuMessages from 'components/admin/UsersTable/ActionsMenu/messages';

import { useIntl } from 'utils/cl-intl';

interface Props {
  user: IUserData;
}

const DeleteUserButton = ({ user }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const [modalOpened, setModalOpened] = useState(false);

  const handleClick = () => {
    if (user.id === authUser?.data.id) {
      window.alert(formatMessage(actionsMenuMessages.youCantDeleteYourself));
    } else {
      setModalOpened(true);
    }
  };

  return (
    <>
      <IconButton
        buttonType="button"
        iconName="delete"
        a11y_buttonActionMessage={formatMessage(actionsMenuMessages.deleteUser)}
        onClick={handleClick}
        iconColor={colors.textSecondary}
        iconColorOnHover={colors.error}
      />
      {modalOpened && (
        <UserDeleteModal user={user} setClose={() => setModalOpened(false)} />
      )}
    </>
  );
};

export default DeleteUserButton;
