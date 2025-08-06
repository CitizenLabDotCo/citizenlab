import React from 'react';

import {
  Box,
  colors,
  Select,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import useFileById from 'api/files/useFileById';
import useFiles from 'api/files/useFiles';
import useProjects from 'api/projects/useProjects';

import useLocalize from 'hooks/useLocalize';

import FileDisplay from 'components/UI/FileAttachments/FileDisplay';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type FileAttachmentProps = {
  fileId?: string;
  projectId?: string;
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
    projectId,
  } = useNode((node) => ({
    fileId: node.data.props.fileId,
    projectId: node.data.props.projectId,
    id: node.id,
  }));

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  // Get list of projects user can access
  const { data: projects, isLoading } = useProjects({
    publicationStatuses: ['published', 'draft'],
  });

  // Get files for selected project
  const { data: files, isFetching: isFetchingFiles } = useFiles({
    project: [projectId || ''],
  });

  // Generate options for the project select dropdown
  const projectOptions = projects
    ? projects.data.map((project) => ({
        value: project.id,
        label: localize(project.attributes.title_multiloc),
      }))
    : [];

  // Generate options for the file select dropdown
  const fileOptions = files
    ? files.data.map((file) => ({
        value: file.id,
        label: file.attributes.name,
      }))
    : [];

  if (isLoading) {
    return <Spinner />;
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
        value={projectId}
        onChange={(option) => {
          setProp((props: FileAttachmentProps) => {
            props.projectId = option.value;
            props.fileId = undefined; // Reset fileId when project changes
          });
        }}
        placeholder={formatMessage(messages.selectProject)}
        options={projectOptions}
        label={formatMessage(messages.selectProject)}
      />
      {isFetchingFiles ? (
        <Spinner />
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
