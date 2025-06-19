import React from 'react';

import {
  Box,
  Button,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import { PARAMS as FOLDER_PARAMS } from './Folders/utils';
import messages from './messages';
import { PARAMS as PROJECT_PARAMS } from './Projects/utils';

interface TabProps {
  message: MessageDescriptor;
  active: boolean;
  icon: IconNames;
  onClick: () => void;
}

const Tab = ({ message, active, icon, onClick }: TabProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      borderBottom={active ? `2px solid ${colors.teal400}` : undefined}
      pb="4px"
      mr="20px"
    >
      <Button
        buttonStyle="text"
        p="0"
        m="0"
        icon={icon}
        iconSize="16px"
        textColor={active ? colors.primary : undefined}
        iconColor={active ? colors.primary : undefined}
        onClick={onClick}
      >
        {formatMessage(message)}
      </Button>
    </Box>
  );
};

const Tabs = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  return (
    <Box as="nav" display="flex" w="100%" mt="12px">
      <Tab
        message={messages.projects}
        icon="projects"
        active={tab === null}
        onClick={() => {
          if (tab === 'folders') {
            removeSearchParams(FOLDER_PARAMS);
          }

          removeSearchParams(['tab']);
        }}
      />
      <Tab
        message={messages.folders}
        icon="folder-outline"
        active={tab === 'folders'}
        onClick={() => {
          if ([null, 'timeline'].includes(tab)) {
            removeSearchParams(PROJECT_PARAMS);
          }

          updateSearchParams({ tab: 'folders' });
        }}
      />
      <Tab
        message={messages.timeline}
        icon="calendar"
        active={tab === 'timeline'}
        onClick={() => {
          if (tab === 'folders') {
            removeSearchParams(FOLDER_PARAMS);
          }

          updateSearchParams({ tab: 'timeline' });
        }}
      />
    </Box>
  );
};

export default Tabs;
