import React, { Suspense, memo, useState, lazy } from 'react';

// Services
import { addProjectModerator } from 'services/projectModerators';
import { isRegularUser } from 'services/permissions/roles';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
const AddModeratorsModal = lazy(
  () => import('components/admin/AddModeratorsModal')
);
import { Box, Label } from '@citizenlab/cl2-component-library';
import UserSelect, { UserOptionTypeBase } from 'components/UI/UserSelect';

// Style
import styled from 'styled-components';

// utils
import { getExceededLimitInfo } from 'components/SeatInfo/utils';

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
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [moderatorToAdd, setModeratorToAdd] =
    useState<UserOptionTypeBase | null>(null);

  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();

  const maximumModerators =
    appConfiguration?.data.attributes.settings.core.maximum_moderators_number;
  const additionalModerators =
    appConfiguration?.data.attributes.settings.core
      .additional_moderators_number;
  if (!appConfiguration || !seats) return null;

  const currentModeratorSeats = seats.data.attributes.moderators_number;
  const { hasReachedOrIsOverPlanSeatLimit } = getExceededLimitInfo(
    hasSeatBasedBillingEnabled,
    currentModeratorSeats,
    additionalModerators,
    maximumModerators
  );

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const handleOnChange = (user?: UserOptionTypeBase) => {
    setModeratorToAdd(user || null);
  };

  const handleOnAddModeratorsClick = async () => {
    if (moderatorToAdd) {
      setProcessing(true);
      await addProjectModerator(projectId, moderatorToAdd.id);
      setProcessing(false);
      setModeratorToAdd(null);
    }
  };

  const handleAddClick = () => {
    const isSelectedUserAModerator =
      moderatorToAdd && !isRegularUser({ data: moderatorToAdd });
    const shouldOpenModal =
      hasSeatBasedBillingEnabled &&
      hasReachedOrIsOverPlanSeatLimit &&
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
          processing={processing}
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
