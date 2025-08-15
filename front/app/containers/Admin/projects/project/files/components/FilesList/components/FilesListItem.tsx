import React from 'react';

import {
  Box,
  colors,
  Text,
  stylingConsts,
  Button,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IFileData } from 'api/files/types';
import useDeleteFile from 'api/files/useDeleteFile';

import Modal from 'components/UI/Modal';
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const { mutate: deleteFile } = useDeleteFile();

  // Check if the file is being used as an attachment
  const isBeingUsedAsAttachment =
    file.relationships.attachments?.data.length &&
    file.relationships.attachments.data.length > 0;

  const viewFileHandler = (fileId: string) => () => {
    setSideViewOpened(true);
    setSelectedFileId(fileId);
  };

  const downloadFileHandler = (_fileId: string) => () => {
    saveFileToDisk(file);
  };

  const deleteFileHandler = (_fileId: string) => () => {
    setIsDeleteModalOpen(true);
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
    <>
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
      <Modal
        opened={isDeleteModalOpen}
        close={() => setIsDeleteModalOpen(false)}
        width="540px"
      >
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection="column"
          mt="20px"
        >
          {isBeingUsedAsAttachment && (
            <Text textAlign="center" fontWeight="bold">
              <FormattedMessage {...messages.fileBeingUsed} />
            </Text>
          )}
          <Text textAlign="center" m="0px">
            <FormattedMessage {...messages.confirmDelete} />{' '}
          </Text>
          {isBeingUsedAsAttachment && (
            <Text textAlign="center" m="0px">
              <FormattedMessage {...messages.willRemoveFromAllLocations} />
            </Text>
          )}

          <Box display="flex" justifyContent="center" gap="8px" mt="24px">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              buttonStyle="secondary-outlined"
            >
              <FormattedMessage {...messages.cancel} />
            </Button>
            <Button
              onClick={() => {
                deleteFile(file.id, {
                  onError: (_error) => {
                    // TODO: Handle any file deletion errors.
                  },
                });
              }}
              buttonStyle="admin-dark"
            >
              <FormattedMessage {...messages.deleteFile} />
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default FilesListItem;
