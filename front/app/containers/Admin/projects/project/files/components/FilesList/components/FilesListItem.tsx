import React from 'react';

import {
  Box,
  colors,
  Text,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IFileData } from 'api/files/types';
import useDeleteFile from 'api/files/useDeleteFile';

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import UserName from 'components/UI/UserName';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { saveFileToDisk } from 'utils/fileUtils';

import messages from '../../messages';

const StyledBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${colors.grey300};
  background-color: ${colors.white};
  border-radius: ${stylingConsts.borderRadius};
  &:hover {
    background-color: ${colors.grey100};
    cursor: pointer;
  }
`;

type Props = {
  file: IFileData;
  setSelectedFileId: (fileId: string | null) => void;
  setSideViewOpened: (opened: boolean) => void;
};

const FilesListItem = ({
  file,
  setSelectedFileId,
  setSideViewOpened,
}: Props) => {
  const { formatMessage } = useIntl();

  const { mutate: deleteFile } = useDeleteFile();

  const viewFileHandler = (fileId: string) => () => {
    setSideViewOpened(true);
    setSelectedFileId(fileId);
  };

  const downloadFileHandler = (_fileId: string) => () => {
    saveFileToDisk(file);
  };

  const deleteFileHandler = (fileId: string) => () => {
    const isBeingUsedAsAttachment =
      file.relationships.attachments?.data.length &&
      file.relationships.attachments.data.length > 0;

    confirm(
      formatMessage(
        isBeingUsedAsAttachment
          ? messages.confirmDeleteEvenIfUsed
          : messages.confirmDelete
      )
    ) &&
      deleteFile(fileId, {
        onError: (_error) => {
          // TODO: Handle any file deletion errors.
        },
      });
  };

  const actions: IAction[] = [
    {
      label: <FormattedMessage {...messages.viewFile} />,
      handler: viewFileHandler(file.id),
      name: 'view',
    },
    {
      label: <FormattedMessage {...messages.downloadFile} />,
      handler: downloadFileHandler(file.id),
      name: 'download',
    },
    {
      label: <FormattedMessage {...messages.deleteFile} />,
      handler: deleteFileHandler(file.id),
      name: 'delete',
    },
  ];

  return (
    <StyledBox onClick={viewFileHandler(file.id)}>
      <Box>
        <Text m="0px">{file.attributes.name}</Text>
        <Box display="flex" gap="4px">
          <Text fontSize="s" color={'coolGrey500'} m="0px">
            {new Date(file.attributes.created_at).toLocaleDateString()}
          </Text>
          <Text fontSize="s" color={'coolGrey500'} m="0px">
            •
          </Text>
          <Text fontSize="s" color={'coolGrey500'} m="0px">
            {formatMessage(messages[file.attributes.category])}
          </Text>
          <Text fontSize="s" color={'coolGrey500'} m="0px">
            •
          </Text>
          <UserName
            userId={file.relationships.uploader.data.id}
            fontSize={14}
            color={colors.coolGrey500}
            showAvatar={true}
          />
        </Box>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreActionsMenu showLabel={false} actions={actions} />
      </Box>
    </StyledBox>
  );
};

export default FilesListItem;
