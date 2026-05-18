import React, { useState } from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Modal from 'components/UI/Modal';
import Tabs, { ITabItem } from 'components/UI/Tabs';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import { Resources } from '../../useAssignModerator';
import messages from '../messages';

import Folders from './Folders';
import Projects from './Projects';
import Spaces from './Spaces';

interface Props {
  opened: boolean;
  user: IUserData;
  onClose: () => void;
  onAssign: (resources: Resources) => Promise<void>;
}

const SetAsModerator = ({ opened, user, onClose, onAssign }: Props) => {
  const { formatMessage } = useIntl();
  const [currentTab, setCurrentTab] = useState('projects');
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const tabs: ITabItem[] = [
    {
      name: 'projects',
      label: formatMessage(messages.projects),
    },
    {
      name: 'folders',
      label: formatMessage(messages.folders),
    },
  ];

  if (spacesEnabled) {
    tabs.push({
      name: 'spaces',
      label: formatMessage(messages.spaces),
    });
  }

  return (
    <div>
      <Modal
        opened={opened}
        close={onClose}
        ariaLabelledBy="set-moderator-modal-title"
      >
        <Title id="set-moderator-modal-title" mb="24px">
          <FormattedMessage
            {...messages.setUserAsManager}
            values={{ name: getFullName(user) }}
          />
        </Title>
        <Box>
          <Tabs
            items={tabs}
            selectedValue={currentTab}
            onClick={setCurrentTab}
          />
        </Box>
        <Box mt="40px">
          {currentTab === 'projects' && (
            <Projects user={user} onClose={onClose} onAssign={onAssign} />
          )}
          {currentTab === 'folders' && (
            <Folders user={user} onClose={onClose} onAssign={onAssign} />
          )}
          {currentTab === 'spaces' && (
            <Spaces user={user} onClose={onClose} onAssign={onAssign} />
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default SetAsModerator;
