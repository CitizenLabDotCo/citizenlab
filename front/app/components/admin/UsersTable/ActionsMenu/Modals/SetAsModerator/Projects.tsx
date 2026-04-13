import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';
import useProjects from 'api/projects/useProjects';
import checkIfUserExceedsSeats from 'api/users/checkIfUserExceedsSeats';
import { IUser, IUserData } from 'api/users/types';

import useLocalize from 'hooks/useLocalize';

import SeatLimitReachedModal from 'components/admin/SeatBasedBilling/SeatLimitReachedModal';
import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  user: IUserData;
  onClose: () => void;
}

const Projects = ({ user, onClose }: Props) => {
  const { mutateAsync: addProjectModerator } = useAddProjectModerator();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: projects } = useProjects({
    publicationStatuses: ['published', 'archived', 'draft'],
  });

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [seatLimitReachedModalOpen, setSeatLimitReachedModalOpen] =
    useState(false);

  const options =
    projects?.data.map((project) => ({
      value: project.id,
      label: localize(project.attributes.title_multiloc),
    })) ?? [];

  const handleAssign = async () => {
    const shouldOpenModal = await checkIfUserExceedsSeats({
      user_id: user.id,
      seat_type: 'moderator',
    });

    if (shouldOpenModal) {
      setSeatLimitReachedModalOpen(true);
    } else {
      doAssign();
    }
  };

  const doAssign = async () => {
    setIsLoading(true);
    try {
      const promises: Promise<IUser>[] = [];

      for (const projectId of selectedProjects) {
        promises.push(
          addProjectModerator({
            projectId,
            user_id: user.id,
          })
        );
      }

      await Promise.all(promises);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <>
      <MultipleSelect
        value={selectedProjects}
        options={options}
        onChange={(selectedOptions) => {
          setSelectedProjects(selectedOptions.map((option) => option.value));
        }}
        label={formatMessage(messages.selectProjects)}
        placeholder={formatMessage(messages.selectPlaceholder)}
      />
      <Box display="flex" justifyContent="flex-end" mt="20px">
        <Button
          onClick={handleAssign}
          disabled={selectedProjects.length === 0}
          processing={isLoading}
        >
          {formatMessage(messages.assign)}
        </Button>
        <SeatLimitReachedModal
          seatType="moderator"
          showModal={seatLimitReachedModalOpen}
          closeModal={() => setSeatLimitReachedModalOpen(false)}
          addModerators={doAssign}
        />
      </Box>
    </>
  );
};

export default Projects;
