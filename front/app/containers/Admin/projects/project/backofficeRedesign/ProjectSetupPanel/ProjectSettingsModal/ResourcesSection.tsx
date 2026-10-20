import React, { useState } from 'react';

import {
  Box,
  Button,
  Icon,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import useFiles from 'api/files/useFiles';

import SettingsSection from 'components/UI/SettingsModal/SettingsSection';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import AddFilesModal from './AddFilesModal';
import ManageFilesModal from './ManageFilesModal';

interface Props {
  projectId: string;
}

const ResourcesSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: files } = useFiles({ project: [projectId] });
  const [manageModalOpened, setManageModalOpened] = useState(false);
  const [addModalOpened, setAddModalOpened] = useState(false);

  if (!files) return null;

  const count = files.data.length;

  return (
    <SettingsSection
      title={formatMessage(messages.filesSection)}
      description={formatMessage(messages.filesDescription)}
      action={
        <Button
          buttonStyle="bo-secondary"
          width="auto"
          onClick={() =>
            count > 0 ? setManageModalOpened(true) : setAddModalOpened(true)
          }
        >
          {formatMessage(count > 0 ? messages.manageFiles : messages.addFiles)}
        </Button>
      }
    >
      {count > 0 && (
        <Box
          display="inline-flex"
          alignItems="center"
          gap="4px"
          h="24px"
          px="8px"
          borderRadius="999px"
          background={colors.teal50}
        >
          <Icon
            name="paperclip"
            width="14px"
            height="14px"
            fill={colors.teal700}
          />
          <Text variant="boMicro" color="teal700" m="0px">
            {formatMessage(messages.filesCount, { count })}
          </Text>
        </Box>
      )}
      <ManageFilesModal
        projectId={projectId}
        opened={manageModalOpened}
        onClose={() => setManageModalOpened(false)}
        onAddFiles={() => setAddModalOpened(true)}
      />
      <AddFilesModal
        projectId={projectId}
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
      />
    </SettingsSection>
  );
};

export default ResourcesSection;
