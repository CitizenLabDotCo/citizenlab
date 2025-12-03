import React, { useMemo } from 'react';

import {
  Box,
  colors,
  Select,
  Spinner,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';
import { useNode, useEditor } from '@craftjs/core';
import { useParams } from 'react-router-dom';

import useDeleteFileAttachment from 'api/file_attachments/useDeleteFileAttachment';
import useFileAttachmentById from 'api/file_attachments/useFileAttachmentById';
import useFiles from 'api/files/useFiles';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import FileDisplay from 'components/UI/FileAttachments/FileDisplay';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type FileAttachmentProps = {
  fileId?: string;
  fileAttachmentId?: string;
  fileName?: string;
};

const FileAttachment = ({
  fileAttachmentId,
  fileName,
}: FileAttachmentProps) => {
  const { data: fileAttachment } = useFileAttachmentById(fileAttachmentId);

  if (!fileAttachment) {
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

  return (
    <Box id="e2e-file-attachment" maxWidth="1200px" margin="0 auto">
      <FileDisplay
        file={{
          // Transform the file data to match the current expected type structure.
          // TODO: In the future, once we remove the old files structure/api, we can simplify this.
          ...fileAttachment.data,
          attributes: {
            ordering: fileAttachment.data.attributes.position,
            name: fileName || fileAttachment.data.attributes.file_name,
            size: fileAttachment.data.attributes.file_size,
            created_at: fileAttachment.data.attributes.created_at,
            updated_at: fileAttachment.data.attributes.updated_at,
            file: {
              url: fileAttachment.data.attributes.file_url,
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
    fileAttachmentId,
    id: currentNodeId,
  } = useNode((node) => ({
    fileId: node.data.props.fileId,
    fileName: node.data.props.fileName,
    fileAttachmentId: node.data.props.fileAttachmentId,
    id: node.id,
  }));

  const { formatMessage } = useIntl();
  const { query } = useEditor();

  // File attachment API hooks
  const { mutate: deleteFileAttachment } = useDeleteFileAttachment({});

  const { projectId } = useParams();

  // Get files for project
  const { data: files, isFetching: isFetchingFiles } = useFiles({
    project: projectId ? [projectId] : [],
  });

  // Get current layout state to check for duplicate files
  const craftjsJson = useMemo(() => {
    try {
      return query.getSerializedNodes();
    } catch {
      return {};
    }
  }, [query]);

  // Generate options for the file select dropdown with usage warnings
  const fileOptions = useMemo(() => {
    if (!files) return [];

    return files.data.map((file) => {
      // Don't count the current node when checking for duplicates
      const otherUsages = Object.entries(craftjsJson).filter(
        ([nodeId, node]) => {
          if (nodeId === currentNodeId) return false; // Skip current node
          if (typeof node !== 'object') return false;

          const nodeType = node.type;
          const isFileAttachmentWidget =
            (typeof nodeType === 'object' &&
              nodeType.resolvedName === 'FileAttachment') ||
            (typeof nodeType === 'string' && nodeType === 'FileAttachment');

          return isFileAttachmentWidget && node.props?.fileId === file.id;
        }
      ).length;

      let label = file.attributes.name;
      if (otherUsages > 0) {
        label += ` (${formatMessage(messages.fileAlreadySelected)})`;
      }

      return {
        value: file.id,
        label,
      };
    });
  }, [files, craftjsJson, currentNodeId, formatMessage]);

  // Check if current file is used elsewhere and show warning
  const currentFileUsageCount = useMemo(() => {
    if (!fileId) return 0;

    return Object.entries(craftjsJson).filter(([nodeId, node]) => {
      if (nodeId === currentNodeId) return false; // Don't count current node
      if (typeof node !== 'object') return false;

      const nodeType = node.type;
      const isFileAttachmentWidget =
        (typeof nodeType === 'object' &&
          nodeType.resolvedName === 'FileAttachment') ||
        (typeof nodeType === 'string' && nodeType === 'FileAttachment');

      return isFileAttachmentWidget && node.props?.fileId === fileId;
    }).length;
  }, [fileId, craftjsJson, currentNodeId]);

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
              // Remove any current file attachment if it exists.
              if (fileAttachmentId) {
                deleteFileAttachment(fileAttachmentId);
                props.fileAttachmentId = undefined;
              }
              // Set the new selected file ID & name - file attachment will be created when layout is saved.
              props.fileId = option.value;
              props.fileName = option.label;
            });
          }}
          placeholder={formatMessage(messages.selectFile)}
          options={fileOptions}
          label={formatMessage(messages.selectFile)}
        />
      )}

      {/* Show warning if the selected file is used elsewhere */}
      {currentFileUsageCount > 0 && (
        <Box
          background={colors.orange100}
          borderRadius="3px"
          p="12px"
          display="flex"
          alignItems="center"
          gap="8px"
        >
          <Icon
            name="info-solid"
            fill={colors.orange500}
            width="16px"
            height="16px"
          />
          <Text
            color="textSecondary"
            fontSize="s"
            m="0px"
            style={{ color: colors.orange500 }}
          >
            {formatMessage(messages.fileAlreadyInUse, {
              count: currentFileUsageCount,
            })}
          </Text>
        </Box>
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
