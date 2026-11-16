import React from 'react';

import { MAX_IMAGE_SIZE_MB } from 'components/UI/QuillEditor/createQuill';
import quillMessages from 'components/UI/QuillEditor/messages';

import Modal from 'design-system/Modal';

import { useIntl } from 'utils/cl-intl';

import styles from './RichTextField.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Nothing to confirm: the image was not added, so there is one dismiss button.
const ImageTooLargeModal = ({ isOpen, onClose }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      size={440}
      title={formatMessage(quillMessages.imageTooLargeTitle)}
      primaryAction={{
        label: formatMessage(quillMessages.imageTooLargeConfirm),
        onPress: onClose,
      }}
    >
      <p className={styles.modalText}>
        {formatMessage(quillMessages.imageTooLarge, {
          maxSizeMb: MAX_IMAGE_SIZE_MB,
        })}
      </p>
    </Modal>
  );
};

export default ImageTooLargeModal;
