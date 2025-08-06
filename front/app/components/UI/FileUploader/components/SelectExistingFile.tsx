import React, { useState } from 'react';

import {
  Box,
  colors,
  Select,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useFiles from 'api/files/useFiles';

import { useIntl } from 'utils/cl-intl';

import { FileType } from '../FileDisplay';
import messages from '../messages';

type Props = {
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
  attachedFiles?: FileType[];
  onFileAddFromRepository?: (files: FileType[]) => void;
};

const SelectExistingFile = ({
  attachedFiles,
  setShowModal,
  onFileAddFromRepository,
}: Props) => {
  const { formatMessage } = useIntl();

  const [fileId, setFileId] = useState<string | null>(null);

  // Get projectID from params
  const { projectId } = useParams() as {
    projectId: string;
  };

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

  // Filter out already attached files
  const filteredFileOptions = fileOptions.filter(
    (option) => !attachedFiles?.some((file) => file.id === option.value)
  );

  return (
    <Box
      background={colors.white}
      display="flex"
      flexDirection="column"
      gap="24px"
    >
      {isFetchingFiles ? (
        <Spinner />
      ) : (
        <>
          <Select
            value={fileId}
            onChange={(option) => {
              setFileId(option.value);

              // Get the selected file from the files list
              const selectedFile = files?.data.find(
                (file) => file.id === option.value
              );

              // If the file isn't already in the attachments list, add it
              if (
                !attachedFiles?.some((file) => file.id === option.value) &&
                selectedFile
              ) {
                onFileAddFromRepository?.([
                  {
                    id: selectedFile.id,
                    name: selectedFile.attributes.name,
                    size: selectedFile.attributes.size || 0,
                    url: selectedFile.attributes.content.url || '',
                    remote: false,
                  },
                ]);
              }

              // Clear the current selection
              setFileId(null);

              // Close modal
              setShowModal?.(false);
            }}
            placeholder={formatMessage(messages.selectFile)}
            options={filteredFileOptions}
            label={formatMessage(messages.fromExistingFiles)}
          />
        </>
      )}
    </Box>
  );
};

export default SelectExistingFile;
