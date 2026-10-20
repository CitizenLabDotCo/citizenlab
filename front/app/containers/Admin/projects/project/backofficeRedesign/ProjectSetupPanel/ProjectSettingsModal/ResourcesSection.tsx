import React, { useState } from 'react';

import {
  Box,
  Button,
  Icon,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';

import SettingsSection from 'components/UI/SettingsModal/SettingsSection';

import { useIntl } from 'utils/cl-intl';

import AddFilesModal from './AddFilesModal';
import ManageFilesModal from './ManageFilesModal';
import useFilesCount from './useFilesCount';
import { FileUploads } from './useFileUploads';

interface Props {
  projectId: string;
  fileUploads: FileUploads;
}

const ResourcesSection = ({ projectId, fileUploads }: Props) => {
  const { formatMessage } = useIntl();
  const count = useFilesCount(projectId);
  const [manageModalOpened, setManageModalOpened] = useState(false);
  const [addModalOpened, setAddModalOpened] = useState(false);

  if (count === undefined) return null;

  return (
    <SettingsSection
      title={formatMessage(messages.filesSection)}
      description={formatMessage(messages.filesDescription)}
      action={
        <Button
          buttonStyle="bo-secondary"
          width="auto"
          height={bo.buttonMedium.height}
          padding={bo.buttonMedium.padding}
          fontSize={bo.buttonMedium.fontSize}
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
          background={colors.teal75}
        >
          <Icon
            name="paperclip"
            width="14px"
            height="14px"
            fill={colors.teal700}
          />
          <Text variant="boMicro" color="teal700" lineHeight="16px" m="0px">
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
        fileUploads={fileUploads}
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
      />
    </SettingsSection>
  );
};

export default ResourcesSection;
