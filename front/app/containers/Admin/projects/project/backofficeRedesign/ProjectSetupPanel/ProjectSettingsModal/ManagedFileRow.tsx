import React, { useState } from 'react';

import {
  Box,
  Button,
  Icon,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import { IFileData } from 'api/files/types';
import useDeleteFile from 'api/files/useDeleteFile';

import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import Modal from 'components/UI/Modal';
import UserName from 'components/UI/UserName';

import { useIntl } from 'utils/cl-intl';
import { saveFileToDisk } from 'utils/fileUtils';

import FileActionsMenu, { FileAction } from './FileActionsMenu';
import FileRow, { FILE_ROW_ACTION_CLASS } from './FileRow';
import { getCategoryMessage, getFileIcon } from './fileUtils';

interface Props {
  file: IFileData;
}

const ManagedFileRow = ({ file }: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  const { name, mime_type, created_at, category, content } = file.attributes;
  const uploaderId = file.relationships.uploader?.data?.id;
  const usedAsAttachment = !!file.relationships.attachments?.data.length;

  const actions: FileAction[] = [
    {
      name: 'view',
      label: formatMessage(filesMessages.viewFile),
      onClick: () => window.open(content.url, '_blank', 'noopener'),
    },
    {
      name: 'download',
      label: formatMessage(filesMessages.downloadFile),
      onClick: () => saveFileToDisk(file),
    },
    {
      name: 'delete',
      label: formatMessage(filesMessages.deleteFile),
      onClick: () => setDeleteModalOpened(true),
    },
  ];

  return (
    <>
      <FileRow>
        <Icon
          name={getFileIcon(mime_type)}
          width="16px"
          height="16px"
          fill={colors.coolGrey500}
        />
        <Box flex="1" minWidth="0">
          <Text
            variant="boControl"
            fontSize="xs"
            m="0px"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {name}
          </Text>
          <Box display="flex" alignItems="center" gap="4px">
            <Text variant="boMicro" color="coolGrey500" m="0px">
              {formatDate(created_at, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {' · '}
              {formatMessage(getCategoryMessage(category))}
              {uploaderId && ' · '}
            </Text>
            {uploaderId && (
              <UserName
                userId={uploaderId}
                fontSize={12}
                color={colors.coolGrey500}
              />
            )}
          </Box>
        </Box>
        <Box className={FILE_ROW_ACTION_CLASS}>
          <FileActionsMenu
            ariaLabel={formatMessage(messages.fileActions, { fileName: name })}
            actions={actions}
          />
        </Box>
      </FileRow>
      <Modal
        variant="bo"
        opened={deleteModalOpened}
        close={() => setDeleteModalOpened(false)}
        width={540}
        header={formatMessage(filesMessages.deleteFile)}
        footer={
          <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
            <Button
              buttonStyle="bo-secondary"
              width="auto"
              onClick={() => setDeleteModalOpened(false)}
            >
              {formatMessage(filesMessages.cancel)}
            </Button>
            <Button
              buttonStyle="bo-delete"
              width="auto"
              processing={isDeleting}
              onClick={() =>
                deleteFile(file.id, {
                  onSuccess: () => setDeleteModalOpened(false),
                })
              }
            >
              {formatMessage(filesMessages.deleteFile)}
            </Button>
          </Box>
        }
      >
        <Box p="24px">
          <Text variant="boControl" m="0px">
            {formatMessage(filesMessages.confirmDelete)}
          </Text>
          {usedAsAttachment && (
            <Text variant="boControl" color="coolGrey600" mt="8px" mb="0px">
              {formatMessage(filesMessages.fileBeingUsed)}{' '}
              {formatMessage(filesMessages.willRemoveFromAllLocations)}
            </Text>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default ManagedFileRow;
