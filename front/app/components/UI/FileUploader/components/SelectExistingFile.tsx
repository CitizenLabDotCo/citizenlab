import React, { useState } from 'react';

import {
  Box,
  colors,
  Icon,
  Select,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useFiles from 'api/files/useFiles';

import { useIntl } from 'utils/cl-intl';

import { FileType } from '../FileDisplay';
import messages from '../messages';

type Props = {
  setFiles?: React.Dispatch<React.SetStateAction<FileType[]>>;
  attachedFiles?: FileType[];
};
const SelectExistingFile = ({ setFiles, attachedFiles }: Props) => {
  const { formatMessage } = useIntl();

  const [fileId, setFileId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [fileNameAdded, setFileNameAdded] = useState('');

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

              // If the file isn't already in the list, add it
              if (
                !attachedFiles?.some((file) => file.id === option.value) &&
                selectedFile
              ) {
                setFiles
                  ? setFiles((prev) => [
                      ...prev,
                      {
                        // Add the selected file to the attachments list.
                        id: option.value,
                        name: option.label,
                        size: selectedFile.attributes.size
                          ? selectedFile.attributes.size
                          : 0,
                        url: selectedFile.attributes.content.url || '',
                        remote: true,
                      },
                    ])
                  : null;
              }

              // Clear the current selection
              setFileId(null);

              // Show a success message
              setShowSuccessMessage(true);
              setFileNameAdded(option.label);
            }}
            placeholder={formatMessage(messages.selectFile)}
            options={fileOptions}
            label={formatMessage(messages.fromExistingFiles)}
          />
          {showSuccessMessage && (
            <Text m="0px" textAlign="right" color="success" fontSize="s">
              {formatMessage(messages.fileAttachedSuccessfully, {
                fileName: fileNameAdded,
              })}
              <Icon
                name="check"
                fill={colors.success}
                width="16px"
                height="16px"
                mb="2px"
                ml="4px"
              />
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

export default SelectExistingFile;
