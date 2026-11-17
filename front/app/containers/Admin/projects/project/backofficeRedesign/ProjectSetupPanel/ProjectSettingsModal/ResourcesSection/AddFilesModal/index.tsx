import React, { useRef, useState } from 'react';

import {
  MAX_FILES,
  MAX_FILE_SIZE,
} from 'containers/Admin/projects/_shared/fileUploads/utils';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import Banner from 'design-system/Banner';
import Checkbox from 'design-system/Checkbox';
import DropZone from 'design-system/DropZone';
import Modal from 'design-system/Modal';

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
        onPress: handleAdd,
        isDisabled: queued.length === 0,
      }}
    >
      <div className={styles.upload}>
        <DropZone
          aria-label={addFilesLabel}
          allowsMultiple
          onSelect={addFiles}
        />
        <p className={styles.hint}>
          {formatMessage(messages.supportedFileTypes)}
        </p>
        {tooManyFiles && (
          <Banner tone="error">
            {formatMessage(filesMessages.maxFilesError, {
              maxFiles: MAX_FILES,
            })}
          </Banner>
        )}
      </div>
      {selected.length > 0 && (
        <div>
          <p className={styles.count}>
            {formatMessage(messages.filesCountWithSize, {
              count: selected.length,
              size: returnFileSize(totalSize),
            })}
          </p>
          <div className={styles.files}>
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
          </div>
          <div className={styles.aiProcessing}>
            <Checkbox
              isSelected={allowAiProcessing}
              isDisabled={queued.length === 0}
              onChange={setAllowAiProcessing}
            >
              {formatMessage(filesMessages.allowAiProcessing)}
            </Checkbox>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddFilesModal;
