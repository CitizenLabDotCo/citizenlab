import React, { useState } from 'react';

import {
  Box,
  CheckboxWithLabel,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'utils/router';

import useAuthUser from 'api/me/useAuthUser';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import FileDropzone from './components/FileDropzone';
import FileUploadActions from './components/FileUploadActions';
import InformationSection from './components/InformationSection/index';
import SelectedFile from './components/SelectedFile';
import tracks from './tracks';
import { FileWithMeta, UploadStatus } from './types';
import { countFilesWithStatus } from './utils';

type Props = {
  setModalOpen?: (open: boolean) => void;
  setShowFirstUploadView?: (value: boolean) => void;
};

const FINISHED_STATUSES: UploadStatus[] = ['uploaded', 'error', 'too_large'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 35;

const FilesUpload = ({ setModalOpen, setShowFirstUploadView }: Props) => {
  const { data: user } = useAuthUser();
  const { formatMessage } = useIntl();
  const { projectId } = useParams({ strict: false }) as { projectId: string };

  const [fileList, setFileList] = useState<FileWithMeta[]>([]);
  const [hasStartedUploading, setHasStartedUploading] = useState(false);
  const [allowAiProcessing, setAllowAiProcessing] = useState(false);
  const [showMaxNumberFilesMessage, setShowMaxNumberFilesMessage] =
    useState(false);

  // Create a React dropzone with the specified options
  const {
    getRootProps: getDropzoneRootProps,
    getInputProps: getDropzoneInputProps,
    open,
  } = useDropzone({
    multiple: true,
    validator: () => null, // Allow all file types to be uploaded.
    onDrop: (acceptedFiles) => {
      // First check if user is trying to drop more than the maximum allowed files
      if (acceptedFiles.length > MAX_FILES) {
        // If so, show message to the user and do not proceed with the upload
        setShowMaxNumberFilesMessage(true);
        return;
      }
      // Reset the message if the number of files is within the limit
      setShowMaxNumberFilesMessage(false);

      const filesWithInitialStatus = acceptedFiles.map((file) => ({
        file,
        // Next, check if any file size exceeds the limit and set the status accordingly.
        // Otherwise, queue the file for upload by setting the status to 'queued'.
        status:
          file.size > MAX_FILE_SIZE ? 'too_large' : ('queued' as UploadStatus),
      }));

      setFileList(filesWithInitialStatus);
    },
  });

  const handleUpload = () => {
    // For each file the user tries to upload, track it with relevant metadata.
    fileList.forEach((file) => {
      trackEventByName(tracks.filesTabFileUploaded, {
        projectId,
        userId: user?.data.id,
        userRole: user?.data.attributes.highest_role,
        fileName: file.file.name,
        fileType: file.file.name.split('.').pop(),
        fileSize: file.file.size,
        aiProcessingAllowed: allowAiProcessing,
      });
    });

    setHasStartedUploading(true);

    // If uploading for the first time, this keeps the initial "First Upload" view visible
    // in the UI until the upload is complete AND the user clicks "Done".
    setShowFirstUploadView?.(true);

    // Update the status of all queued files to 'uploading'.
    // This then triggers the upload process to start in the "SelectedFile" components.
    setFileList((prev) =>
      prev.map((file) =>
        file.status === 'queued' ? { ...file, status: 'uploading' } : file
      )
    );
  };

  const finishedUploading =
    hasStartedUploading &&
    fileList.every(({ status }) => FINISHED_STATUSES.includes(status));

  const aiCheckboxDisabled = hasStartedUploading || finishedUploading;

  return (
    <>
      {fileList.length > 0 ? (
        <>
          <Title fontWeight="semi-bold" color="coolGrey700" variant="h3">
            {formatMessage(messages.confirmAndUploadFiles)}
          </Title>

          <Box maxHeight="300px" overflowY="auto" overflowX="hidden" mt="20px">
            {fileList.map((item, index) => (
              <SelectedFile
                key={`${item.file.name}-${index}`}
                fileMeta={item}
                projectId={projectId}
                onStatusUpdate={(updatedStatus) => {
                  // Update the status of the file in the list
                  setFileList((prev) =>
                    prev.map((file) =>
                      file.file === item.file
                        ? { ...file, ...updatedStatus }
                        : file
                    )
                  );
                }}
              />
            ))}
          </Box>

          <Box mt="20px">
            <CheckboxWithLabel
              checked={allowAiProcessing}
              disabled={hasStartedUploading || finishedUploading}
              onChange={(event) => {
                // If the checkbox is disabled, do not allow changes
                if (aiCheckboxDisabled) return;

                setAllowAiProcessing(event.target.checked);
                // Update the AI processing flag for all files in the list
                setFileList((prev) =>
                  prev.map((file) => ({
                    ...file,
                    ai_processing_allowed: event.target.checked,
                  }))
                );
              }}
              label={
                <Text ml="8px" m="0px" color="coolGrey600" fontSize="s">
                  {formatMessage(messages.allowAiProcessing)}
                </Text>
              }
            />
          </Box>

          <FileUploadActions
            hasStartedUploading={hasStartedUploading}
            finishedUploading={finishedUploading}
            onUpload={handleUpload}
            onClose={() => {
              setFileList([]);
              setHasStartedUploading(false);
              setModalOpen?.(false);
              // If we're on the initial "First Upload" UI view, this will close it and open the full file list view.
              setShowFirstUploadView?.(false);
            }}
          />
          {/* Upload summary (# uploaded and # errors) */}
          {finishedUploading && (
            <Box display="flex" justifyContent="center">
              <Text m="0px" mt="8px" color="coolGrey600" fontSize="s">
                {formatMessage(messages.uploadSummary, {
                  numberOfFiles: countFilesWithStatus(fileList, 'uploaded'),
                  numberOfErrors:
                    countFilesWithStatus(fileList, 'error') +
                    countFilesWithStatus(fileList, 'too_large'),
                })}
              </Text>
            </Box>
          )}
        </>
      ) : (
        <>
          <InformationSection />
          <FileDropzone
            getDropzoneRootProps={getDropzoneRootProps}
            getDropzoneInputProps={getDropzoneInputProps}
            open={open}
          />
          {showMaxNumberFilesMessage && (
            <Text
              mt="8px"
              textAlign="center"
              m="0px"
              color="red500"
              fontSize="s"
            >
              {formatMessage(messages.maxFilesError, {
                maxFiles: MAX_FILES,
              })}
            </Text>
          )}
        </>
      )}
    </>
  );
};

export default FilesUpload;
