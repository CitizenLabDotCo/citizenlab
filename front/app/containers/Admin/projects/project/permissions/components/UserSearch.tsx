// Libraries
import React, { memo, useState } from 'react';

// Services
import { addProjectModerator } from 'services/projectModerators';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import AddCollaboratorsModal from 'components/admin/AddCollaboratorsModal';
import { Box } from '@citizenlab/cl2-component-library';
import UserSelect from 'components/UI/UserSelect';
// Style
import styled from 'styled-components';

const AddButton = styled(Button)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 20px;
`;

interface Props {
  projectId: string;
}

const UserSearch = memo(({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [moderatorToAdd, setModeratorToAdd] = useState<string | null>(null);

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const handleOnChange = (userId: string) => {
    setModeratorToAdd(userId);
  };

  const handleOnAddModeratorsClick = async () => {
    if (moderatorToAdd) {
      setProcessing(true);
      await addProjectModerator(projectId, moderatorToAdd);
      setProcessing(false);
      setModeratorToAdd(null);
    }
  };

  const handleAddClick = () => {
    if (hasSeatBasedBillingEnabled) {
      openModal();
    } else {
      handleOnAddModeratorsClick();
    }
  };

  return (
    <Box width="100%">
      <Box display="flex" alignItems="center" mb="24px">
        <Box width="500px">
          <UserSelect
            id="projectModeratorUserSearch"
            inputId="projectModeratorUserSearchInputId"
            selectedUserId={moderatorToAdd}
            onChange={handleOnChange}
            placeholder={formatMessage(messages.searchUsers)}
            hideAvatar
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
        />
      </Box>
      {hasSeatBasedBillingEnabled && (
        <AddCollaboratorsModal
          addModerators={handleOnAddModeratorsClick}
          showModal={showModal}
          closeModal={closeModal}
        />
      )}
    </Box>
  );
});

export default UserSearch;
