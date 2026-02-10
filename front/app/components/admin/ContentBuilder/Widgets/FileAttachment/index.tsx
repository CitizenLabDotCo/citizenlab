import React, { useMemo } from 'react';

import {
  Box,
  colors,
  Select,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';
import { useNode, useEditor } from '@craftjs/core';
import { useParams } from 'utils/router';

import useFileAttachments from 'api/file_attachments/useFileAttachments';
import useFileById from 'api/files/useFileById';
import useFiles from 'api/files/useFiles';

import { useContentBuilderLayoutContext } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import FileDisplay from 'components/UI/FileAttachments/FileDisplay';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import FilePlaceholder from './FilePlaceholder';
import messages from './messages';
import { getIsFileAlreadyUsed } from './utils';

type FileAttachmentProps = {
  fileId?: string;
};

const FilePreview = ({ fileId }: { fileId?: string }) => {
  const { data: file, isLoading } = useFileById(fileId);

  if (!fileId) {
    return (
      <Box maxWidth="1200px" margin="0 auto">
        <FilePlaceholder>
          <FormattedMessage {...messages.selectFilePrompt} />
        </FilePlaceholder>
      </Box>
    );
  }

  if (isLoading) {
    return null;
  }

  if (!file) {
    return (
      <Box maxWidth="1200px" margin="0 auto">
        <FilePlaceholder variant="error">
          <FormattedMessage {...messages.fileMissing} />
        </FilePlaceholder>
      </Box>
    );
  }

  return (
    <Box
      id="e2e-file-attachment"
      maxWidth="1200px"
      style={{ pointerEvents: 'none' }}
    >
      <FileDisplay
        file={{
          id: file.data.id,
          type: 'file',
          attributes: {
            name: file.data.attributes.name,
            file: { url: '' },
            ordering: null,
            size: file.data.attributes.size,
            created_at: '',
            updated_at: '',
          },
        }}
      />
    </Box>
  );
};

const FileAttachment = ({ fileId }: FileAttachmentProps) => {
  const { layoutId } = useContentBuilderLayoutContext();
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const { data: attachments } = useFileAttachments({
    attachable_id: layoutId,
    attachable_type: 'ContentBuilder::Layout',
  });

  const attachment = useMemo(() => {
    return attachments?.data.find(
      (a) => a.relationships.file.data.id === fileId
    );
  }, [attachments, fileId]);

  if (attachment) {
    const attachmentAttributes = attachment.attributes;
    return (
      <Box id="e2e-file-attachment" maxWidth="1200px">
        <FileDisplay
          file={{
            id: attachment.relationships.file.data.id,
            type: 'file',
            attributes: {
              ordering: 1,
              name: attachmentAttributes.file_name,
              size: attachmentAttributes.file_size,
              created_at: attachmentAttributes.created_at,
              updated_at: attachmentAttributes.updated_at,
              file: {
                url: attachmentAttributes.file_url,
              },
            },
          }}
        />
      </Box>
    );
  }

  // No attachment in view mode -> hides widget
  if (!enabled) return null;

  return <FilePreview fileId={fileId} />;
};

const FileAttachmentSettings = () => {
  const {
    actions: { setProp },
    fileId,
  } = useNode((node) => ({
    fileId: node.data.props.fileId,
  }));

  const { formatMessage } = useIntl();
  const { query } = useEditor();
  const { projectId } = useParams({ strict: false });

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
    if (option.value === fileId) return true; // Always include the currently selected file
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
              props.fileId = option.value;
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
