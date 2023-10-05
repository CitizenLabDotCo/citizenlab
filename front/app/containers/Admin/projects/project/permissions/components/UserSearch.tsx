import React, { Suspense, memo, useState, lazy } from 'react';

// Services
import { isRegularUser } from 'services/permissions/roles';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useExceedsSeats from 'hooks/useExceedsSeats';
import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
const AddModeratorsModal = lazy(
  () => import('components/admin/SeatBasedBilling/AddModeratorsModal')
);
import { Box, Label } from '@citizenlab/cl2-component-library';
import UserSelect from 'components/UI/UserSelect';

// Style
import styled from 'styled-components';

// typings
import { IUserData } from 'api/users/types';

const AddButton = styled(Button)`
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
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  const { mutate: addProjectModerator, isLoading } = useAddProjectModerator();

  const [showModal, setShowModal] = useState(false);
  const [moderatorToAdd, setModeratorToAdd] = useState<IUserData | null>(null);

  const exceedsSeats = useExceedsSeats()({
    newlyAddedModeratorsNumber: 1,
  });

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
    const isSelectedUserAModerator =
      moderatorToAdd && !isRegularUser({ data: moderatorToAdd });
    const shouldOpenModal =
      hasSeatBasedBillingEnabled &&
      exceedsSeats.moderator &&
      !isSelectedUserAModerator;
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
          buttonStyle="cl-blue"
          icon="plus-circle"
          padding="10px 16px"
          onClick={handleAddClick}
          disabled={!moderatorToAdd}
          processing={isLoading}
          data-cy="e2e-add-project-moderator-button"
        />
      </Box>
      {hasSeatBasedBillingEnabled && (
        <Suspense fallback={null}>
          <AddModeratorsModal
            addModerators={handleOnAddModeratorsClick}
            showModal={showModal}
            closeModal={closeModal}
          />
        </Suspense>
      )}
    </Box>
  );
});

export default UserSearch;
