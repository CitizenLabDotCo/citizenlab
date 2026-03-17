import React, { Suspense, memo, useState, lazy } from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';
import { IUserData } from 'api/users/types';

import useExceedsSeats from 'hooks/useExceedsSeats';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import UserSelect from 'components/UI/UserSelect';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const SeatLimitReachedModal = lazy(
  () => import('components/admin/SeatBasedBilling/SeatLimitReachedModal')
);

const AddButton = styled(ButtonWithLink)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 20px;
`;

interface Props {
  projectId: string;
  label?: JSX.Element | string;
}

const UserSearch = memo(({ projectId, label }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: addProjectModerator, isLoading } = useAddProjectModerator();

  const [showModal, setShowModal] = useState(false);
  const [moderatorToAdd, setModeratorToAdd] = useState<IUserData | null>(null);

  const { loading, checkIfUserExceedsSeats } = useExceedsSeats();

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const handleOnChange = (user?: IUserData) => {
    setModeratorToAdd(user || null);
  };

  const handleOnAddModeratorsClick = () => {
    if (moderatorToAdd) {
      addProjectModerator(
        { projectId, moderatorId: moderatorToAdd.id },
        {
          onSuccess: () => {
            setModeratorToAdd(null);
          },
        }
      );
    }
  };

  const handleAddClick = () => {
    if (loading || !moderatorToAdd) return;
    const shouldOpenModal = checkIfUserExceedsSeats(
      moderatorToAdd,
      'moderator'
    );

    if (shouldOpenModal) {
      openModal();
    } else {
      handleOnAddModeratorsClick();
    }
  };

  return (
    <Box width="100%">
      {label && (
        <Box mb="0px">
          <Label htmlFor={'projectModeratorUserSearch'}>{label}</Label>
        </Box>
      )}
      <Box display="flex" alignItems="center" mb="24px">
        <Box width="500px">
          <UserSelect
            id="projectModeratorUserSearch"
            inputId="projectModeratorUserSearchInputId"
            selectedUserId={moderatorToAdd?.id || null}
            onChange={handleOnChange}
            placeholder={formatMessage(messages.searchUsers)}
            isNotProjectModeratorOfProjectId={projectId}
          />
        </Box>

        <AddButton
          text={formatMessage(messages.addModerators)}
          buttonStyle="admin-dark"
          icon="plus-circle"
          padding="10px 16px"
          onClick={handleAddClick}
          disabled={!moderatorToAdd}
          processing={isLoading}
          data-cy="e2e-add-project-moderator-button"
        />
      </Box>
      <Suspense fallback={null}>
        <SeatLimitReachedModal
          seatType="moderator"
          addModerators={handleOnAddModeratorsClick}
          showModal={showModal}
          closeModal={closeModal}
        />
      </Suspense>
    </Box>
  );
});

export default UserSearch;
