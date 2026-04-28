import React, { useState } from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { SpaceData } from 'api/spaces/types';
import useDeleteSpace from 'api/spaces/useDeleteSpace';

import useLocalize from 'hooks/useLocalize';

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import TypedDeleteConfirmationModal from 'components/UI/TypedDeleteConfirmationModal';
import typedDeleteConfirmationMessages from 'components/UI/TypedDeleteConfirmationModal/messages';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

interface Props {
  space: SpaceData;
}

const ActionsMenu = ({ space }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { mutate: deleteSpace, isLoading } = useDeleteSpace();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data: authUser } = useAuthUser();

  if (!isAdmin(authUser)) {
    return null;
  }

  const actions: IAction[] = [
    {
      handler: async () => {
        setShowDeleteModal(true);
      },
      label: formatMessage(messages.deleteSpaceButton),
      icon: 'delete' as const,
      isLoading,
    },
  ];

  const handleCloseDeleteModal = () => {
    if (!isLoading) {
      setShowDeleteModal(false);
    }
  };

  const handleDeleteSpace = () => {
    deleteSpace(space.id);
  };

  return (
    <>
      <MoreActionsMenu
        showLabel={false}
        actions={actions}
        color={colors.black}
      />
      <TypedDeleteConfirmationModal
        opened={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteSpace}
        title={messages.deleteSpaceModalTitle}
        entityName={localize(space.attributes.title_multiloc)}
        mainWarning={messages.deleteSpaceModalWarning}
        confirmationWord={
          typedDeleteConfirmationMessages.confirmationWordDelete
        }
        deleteButtonText={messages.deleteSpaceButton}
        isDeleting={isLoading}
      />
    </>
  );
};

export default ActionsMenu;
