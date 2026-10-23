import React, { useRef, useState } from 'react';

import {
  Box,
  Button,
  CheckboxWithLabel,
  Text,
  bo,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';

import {
  MAX_FILES,
  MAX_FILE_SIZE,
} from 'containers/Admin/projects/_shared/fileUploads/utils';
import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { returnFileSize } from 'utils/fileUtils';

import { FILE_MODAL_HEIGHT } from './FileRow';
import UploadingFileRow from './UploadingFileRow';
import { FilesDraft, Upload } from './useFilesDraft';

interface Props {
  draft: FilesDraft;
  opened: boolean;
  onClose: () => void;
}

const AddFilesModal = ({ draft, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const [selected, setSelected] = useState<Upload[]>([]);
  const [tooManyFiles, setTooManyFiles] = useState(false);
  const [allowAiProcessing, setAllowAiProcessing] = useState(false);
  const nextKey = useRef(0);

  const addFiles = (files: File[]) => {
    const tooMany = selected.length + files.length > MAX_FILES;
    setTooManyFiles(tooMany);
    if (tooMany) return;

    setSelected((current) => [
      ...current,
      ...files.map(
        (file): Upload => ({
          key: nextKey.current++,
          file,
          status: file.size > MAX_FILE_SIZE ? 'too_large' : 'queued',
        })
      ),
    ]);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    multiple: true,
    noClick: true,
    // Allow all file types to be uploaded.
    validator: () => null,
    onDrop: addFiles,
  });

  const queued = selected.filter(({ status }) => status === 'queued');
  const totalSize = selected.reduce((sum, { file }) => sum + file.size, 0);

  const handleClose = () => {
    setSelected([]);
    setTooManyFiles(false);
    setAllowAiProcessing(false);
    onClose();
  };

  const handleAdd = () => {
    draft.addFiles(queued, allowAiProcessing);
    handleClose();
  };

  return (
    <Modal
      variant="bo"
      opened={opened}
      close={handleClose}
      width={560}
      height={selected.length > 0 ? FILE_MODAL_HEIGHT : undefined}
      header={formatMessage(messages.addFiles)}
      footer={
        <Box display="flex" justifyContent="flex-end" width="100%">
          <Button
            buttonStyle="bo-primary"
            width="auto"
            height={bo.buttonMedium.height}
            padding={bo.buttonMedium.padding}
            fontSize={bo.buttonMedium.fontSize}
            disabled={queued.length === 0}
            onClick={handleAdd}
          >
            {formatMessage(messages.addFiles)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Box
          {...getRootProps()}
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="12px"
          minHeight="88px"
          p="16px"
          border={`1px dashed ${colors.coolGrey300}`}
          borderRadius={stylingConsts.borderRadius}
        >
          <Text variant="boMicro" color="coolGrey500" m="0px">
            {formatMessage(messages.dropFilesHereOr)}
          </Text>
          <Button
            buttonStyle="bo-secondary"
            width="auto"
            height={bo.buttonMedium.height}
            padding={bo.buttonMedium.padding}
            fontSize={bo.buttonMedium.fontSize}
            onClick={open}
          >
            {formatMessage(filesMessages.chooseFiles)}
          </Button>
          <input {...getInputProps()} />
        </Box>
        <Text variant="boMicro" color="coolGrey500" mt="8px" mb="0px">
          {formatMessage(messages.supportedFileTypes)}
        </Text>
        {tooManyFiles && (
          <Text variant="boMicro" color="red600" mt="8px" mb="0px">
            {formatMessage(filesMessages.maxFilesError, {
              maxFiles: MAX_FILES,
            })}
          </Text>
        )}
        {selected.length > 0 && (
          <Box mt="16px">
            <Text variant="boMicro" color="coolGrey500" mb="4px" mt="0px">
              {formatMessage(messages.filesCountWithSize, {
                count: selected.length,
                size: returnFileSize(totalSize),
              })}
            </Text>
            <Box mx="-8px">
              {selected.map(({ key, file, status, category }) => (
                <UploadingFileRow
                  key={key}
                  file={file}
                  status={status}
                  category={category}
                  onCategoryChange={(category) =>
                    setSelected((current) =>
                      current.map((upload) =>
                        upload.key === key ? { ...upload, category } : upload
                      )
                    )
                  }
                  onRemove={() =>
                    setSelected((current) =>
                      current.filter((upload) => upload.key !== key)
                    )
                  }
                />
              ))}
            </Box>
            <Box mt="16px">
              <CheckboxWithLabel
                size="20px"
                checked={allowAiProcessing}
                disabled={queued.length === 0}
                onChange={(event) => setAllowAiProcessing(event.target.checked)}
                label={
                  <Text variant="boControl" fontSize="xs" m="0px">
                    {formatMessage(filesMessages.allowAiProcessing)}
                  </Text>
                }
              />
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default AddFilesModal;
