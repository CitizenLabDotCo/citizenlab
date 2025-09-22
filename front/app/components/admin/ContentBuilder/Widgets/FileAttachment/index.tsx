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

import useAddFileAttachment from 'api/file_attachments/useAddFileAttachment';
import useDeleteFileAttachment from 'api/file_attachments/useDeleteFileAttachment';
import useFileAttachmentById from 'api/file_attachments/useFileAttachmentById';
import useFileAttachments from 'api/file_attachments/useFileAttachments';
import useFiles from 'api/files/useFiles';
import useProjectDescriptionBuilderLayout from 'api/project_description_builder/useProjectDescriptionBuilderLayout';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import FileDisplay from 'components/UI/FileAttachments/FileDisplay';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type FileAttachmentProps = {
  fileId?: string;
  fileAttachmentId?: string;
};

const FileAttachment = ({ fileAttachmentId }: FileAttachmentProps) => {
  const { data: fileAttachment } = useFileAttachmentById(fileAttachmentId);

  if (!fileAttachment) {
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
            name: fileAttachment.data.attributes.file_name,
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
    id: node.id,
  }));

  const { formatMessage } = useIntl();
  // File attachment API hooks
  const { mutate: addFileAttachment } = useAddFileAttachment({});
  const { mutate: deleteFileAttachment } = useDeleteFileAttachment({});

  const { projectId } = useParams();

  const { data: projectDescriptionLayout } = useProjectDescriptionBuilderLayout(
    projectId || ''
  );

  const { data: fileAttachments } = useFileAttachments({
    attachable_type: 'ContentBuilder::Layout',
    attachable_id: projectDescriptionLayout?.data.id,
  });

  console.log({ fileAttachments });

  // Get files for project
  const { data: files, isFetching: isFetchingFiles } = useFiles({
    project: projectId ? [projectId] : [],
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
              // Remove any current file attachment.
              if (props.fileAttachmentId) {
                deleteFileAttachment(props.fileAttachmentId);
              }
              // Set the new selected file ID.
              props.fileId = option.value;

              // Create a new file attachment to the project description layout.
              projectDescriptionLayout?.data.id &&
                addFileAttachment(
                  {
                    file_id: option.value,
                    attachable_type: 'ContentBuilder::Layout',
                    attachable_id: projectDescriptionLayout.data.id,
                  },
                  {
                    onSuccess: (data) => {
                      // Update the node's fileId prop with the newly created attachment.
                      setProp((props: FileAttachmentProps) => {
                        props.fileAttachmentId = data.data.id;
                      });
                    },
                    onError: (errors) => {
                      if (errors.file_id[0].value === 'taken') {
                        // Handle the case where the file is already attached
                        // by setting the fileAttachmentId prop to the existing attachment's ID.
                        const existingAttachment = projectDescriptionLayout;
                      }
                    },
                  }
                );
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
