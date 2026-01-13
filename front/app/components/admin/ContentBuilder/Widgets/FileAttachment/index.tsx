import React, { useMemo } from 'react';

import {
  Box,
  colors,
  Select,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { useParams } from 'react-router-dom';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';
import useFileAttachments from 'api/file_attachments/useFileAttachments';
import useFiles from 'api/files/useFiles';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import FileDisplay from 'components/UI/FileAttachments/FileDisplay';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type FileAttachmentProps = {
  fileId?: string;
  fileName?: string;
};

const FileAttachment = ({ fileId, fileName }: FileAttachmentProps) => {
  // would be better to get the layout using a context provider
  const { projectId } = useParams();
  const { data: layout } = useContentBuilderLayout('project', projectId || '');

  const { data: attachments } = useFileAttachments({
    attachable_id: layout?.data.id,
    attachable_type: 'ContentBuilder::Layout',
  });

  const attachment = useMemo(() => {
    return attachments?.data.find(
      (a) => a.relationships.file.data.id === fileId
    );
  }, [attachments, fileId]);

  // Show placeholder with just the file name if we haven't saved yet
  if (!attachment) {
    if (fileName) {
      return (
        <Box
          id="e2e-file-attachment"
          maxWidth="1200px"
          margin="0 auto"
          style={{ pointerEvents: 'none' }}
        >
          <FileDisplay
            file={{
              id: 'temp-id',
              type: 'file',
              attributes: {
                name: fileName,
                file: { url: '' },
                ordering: null,
                size: 0,
                created_at: '',
                updated_at: '',
              },
            }}
          />
        </Box>
      );
    }
    return null;
  }

  // Saved state - show actual file
  return (
    <Box id="e2e-file-attachment" maxWidth="1200px" margin="0 auto">
      <FileDisplay
        file={{
          id: attachment.id,
          type: 'file',
          attributes: {
            ordering: attachment.attributes.position,
            name: attachment.attributes.file_name,
            size: attachment.attributes.file_size,
            created_at: attachment.attributes.created_at,
            updated_at: attachment.attributes.updated_at,
            file: {
              url: attachment.attributes.file_url,
            },
          },
        }}
      />
    </Box>
  );
};

const FileAttachmentSettings = () => {
  const {
    actions: { setProp },
    fileId,
  } = useNode((node) => ({
    fileId: node.data.props.fileId,
  }));

  const { formatMessage } = useIntl();
  const { projectId } = useParams();

  const { data: files, isFetching: isFetchingFiles } = useFiles({
    project: projectId ? [projectId] : [],
  });

  const fileOptions = files
    ? files.data.map((file) => ({
        value: file.id,
        label: file.attributes.name,
      }))
    : [];

  if (isFetchingFiles) {
    return <Spinner />;
  }

  return (
    <Box
      background={colors.white}
      my="32px"
      display="flex"
      flexDirection="column"
      gap="12px"
    >
      {fileOptions.length === 0 ? (
        <Text m="0px">{formatMessage(messages.noFilesAvailable)}</Text>
      ) : (
        <Select
          value={fileId}
          onChange={(option) => {
            setProp((props: FileAttachmentProps) => {
              props.fileId = option.value;
              props.fileName = option.label;
            });
          }}
          placeholder={formatMessage(messages.selectFile)}
          options={fileOptions}
          label={formatMessage(messages.selectFile)}
        />
      )}

      <ButtonWithLink
        linkTo={`/admin/projects/${projectId}/files`}
        buttonStyle="text"
        icon="upload-file"
        openLinkInNewTab={true}
      >
        {formatMessage(messages.uploadFiles)}
      </ButtonWithLink>
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
