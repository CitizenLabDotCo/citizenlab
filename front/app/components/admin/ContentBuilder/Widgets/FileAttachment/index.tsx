import React, { useMemo } from 'react';

import {
  Box,
  colors,
  Select,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';
import { useNode, useEditor } from '@craftjs/core';
import { useParams } from 'react-router-dom';

import useFileAttachmentById from 'api/file_attachments/useFileAttachmentById';
import useFiles from 'api/files/useFiles';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import FileDisplay from 'components/UI/FileAttachments/FileDisplay';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { getIsFileAlreadyUsed } from './utils';

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

  if (
    !fileAttachment ||
    fileName !== fileAttachment.data.attributes.file_name // We've changed the file
  ) {
    // Show placeholder with just the file name if we haven't saved yet
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
  } = useNode((node) => ({
    fileId: node.data.props.fileId,
    fileAttachmentId: node.data.props.fileAttachmentId,
  }));

  const { formatMessage } = useIntl();
  const { query } = useEditor();
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
  let fileOptions = useMemo(() => {
    if (!files) return [];

    return files.data.map((file) => {
      return {
        value: file.id,
        label: file.attributes.name,
      };
    });
  }, [files]);

  // Filter out any files already being used in the layout
  fileOptions = fileOptions.filter((option) => {
    const isFileUsed = getIsFileAlreadyUsed(craftjsJson, option.value);
    return !isFileUsed;
  });

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
              // Set the new selected file ID & name
              // File attachment will be created on BE when layout is saved.
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
