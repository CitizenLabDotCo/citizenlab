import React from 'react';

import {
  Box,
  colors,
  Select,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { useParams } from 'react-router-dom';

import useFileById from 'api/files/useFileById';
import useFiles from 'api/files/useFiles';

import FileDisplay from 'components/UI/FileAttachments/FileDisplay';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type FileAttachmentProps = {
  fileId?: string;
};

const FileAttachment = ({ fileId }: FileAttachmentProps) => {
  const { data: file } = useFileById(fileId);

  return (
    <Box id="e2e-file-attachment" maxWidth="1200px" margin="0 auto">
      <FileDisplay fileNewType={file?.data} />
    </Box>
  );
};

const FileAttachmentSettings = () => {
  const {
    actions: { setProp },
    fileId,
  } = useNode((node) => ({
    fileId: node.data.props.fileId,
    id: node.id,
  }));

  const { formatMessage } = useIntl();

  const { projectId } = useParams();

  // Get files for selected project
  const { data: files, isFetching: isFetchingFiles } = useFiles({
    project: [projectId || ''],
  });

  // Generate options for the file select dropdown
  const fileOptions = files
    ? files.data.map((file) => ({
        value: file.id,
        label: file.attributes.name,
      }))
    : [];

  if (isFetchingFiles) {
    return <Spinner />;
  }

  // If no files are available, show a message
  if (fileOptions.length === 0) {
    return <Text>{formatMessage(messages.noFilesAvailable)}</Text>;
  }

  return (
    <Box
      background={colors.white}
      my="32px"
      display="flex"
      flexDirection="column"
      gap="24px"
    >
      <Select
        value={fileId}
        onChange={(option) => {
          setProp((props: FileAttachmentProps) => {
            props.fileId = option.value;
          });
        }}
        placeholder={formatMessage(messages.selectFile)}
        options={fileOptions}
        label={formatMessage(messages.selectFile)}
      />
    </Box>
  );
};

FileAttachment.craft = {
  related: {
    settings: FileAttachmentSettings,
  },
  custom: {
    title: messages.fileAttachment,
    noPointerEvents: true,
  },
};

export default FileAttachment;
