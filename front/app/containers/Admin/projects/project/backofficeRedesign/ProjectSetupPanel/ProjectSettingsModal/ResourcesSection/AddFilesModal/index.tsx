import React from 'react';

import { Controller, useFieldArray, useForm } from 'react-hook-form';

import Banner from 'design-system/Banner';
import Checkbox from 'design-system/Checkbox';
import DropZone from 'design-system/DropZone';
import Modal from 'design-system/Modal';
import Text from 'design-system/Text';

import {
  MAX_FILES,
  MAX_FILE_SIZE,
} from 'containers/Admin/projects/_shared/fileUploads/utils';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import { useIntl } from 'utils/cl-intl';
import { returnFileSize } from 'utils/fileUtils';

import resourcesSectionMessages from '../messages';
import UploadingFileRow from '../UploadingFileRow';
import { FilesDraft, Upload } from '../useFilesDraft';

import styles from './AddFilesModal.module.css';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  draft: FilesDraft;
  opened: boolean;
  onClose: () => void;
}

interface FormValues {
  files: Pick<Upload, 'file' | 'status' | 'category'>[];
  allowAiProcessing: boolean;
}

const AddFilesModal = ({ draft, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { files: [], allowAiProcessing: false },
  });
  const {
    fields: selected,
    append,
    remove,
  } = useFieldArray({ control, name: 'files' });

  const addFiles = (files: File[]) => {
    if (selected.length + files.length > MAX_FILES) {
      setError('files', { type: 'max' });
      return;
    }

    clearErrors('files');
    append(
      files.map((file) => ({
        file,
        status: file.size > MAX_FILE_SIZE ? 'too_large' : 'queued',
      }))
    );
  };

  const queuedCount = selected.filter(
    ({ status }) => status === 'queued'
  ).length;
  const totalSize = selected.reduce((sum, { file }) => sum + file.size, 0);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = handleSubmit(({ files, allowAiProcessing }) => {
    draft.addFiles(
      files.filter(({ status }) => status === 'queued'),
      allowAiProcessing
    );
    handleClose();
  });

  const addFilesLabel = formatMessage(resourcesSectionMessages.addFiles);

  return (
    <Modal
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
      title={addFilesLabel}
      size={560}
      primaryAction={{
        label: addFilesLabel,
        onPress: () => handleAdd(),
        isDisabled: queuedCount === 0,
      }}
    >
      <div className={styles.upload}>
        <DropZone
          aria-label={addFilesLabel}
          allowsMultiple
          onSelect={addFiles}
        />
        <Text variant="small" tone="secondary">
          {formatMessage(messages.supportedFileTypes)}
        </Text>
        {errors.files && (
          <Banner tone="error">
            {formatMessage(filesMessages.maxFilesError, {
              maxFiles: MAX_FILES,
            })}
          </Banner>
        )}
      </div>
      {selected.length > 0 && (
        <div>
          <Text variant="small" tone="secondary" className={styles.count}>
            {formatMessage(messages.filesCountWithSize, {
              count: selected.length,
              size: returnFileSize(totalSize),
            })}
          </Text>
          <div className={styles.files}>
            {selected.map(({ id, file, status }, index) => (
              <Controller
                key={id}
                control={control}
                name={`files.${index}.category`}
                render={({ field }) => (
                  <UploadingFileRow
                    file={file}
                    status={status}
                    category={field.value}
                    onCategoryChange={field.onChange}
                    onRemove={() => remove(index)}
                  />
                )}
              />
            ))}
          </div>
          <div className={styles.aiProcessing}>
            <Controller
              control={control}
              name="allowAiProcessing"
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  isDisabled={queuedCount === 0}
                  onChange={field.onChange}
                >
                  {formatMessage(filesMessages.allowAiProcessing)}
                </Checkbox>
              )}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddFilesModal;
