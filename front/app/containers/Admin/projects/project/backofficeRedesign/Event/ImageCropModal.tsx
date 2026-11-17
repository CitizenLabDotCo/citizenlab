import React from 'react';

import { UploadFile } from 'typings';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';

import Modal from 'design-system/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  opened: boolean;
  aspectRatioWidth: number;
  aspectRatioHeight: number;
  image: UploadFile | null;
  onCrop: (croppedImage: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

const ImageCropModal = ({
  opened,
  aspectRatioWidth,
  aspectRatioHeight,
  image,
  onCrop,
  onRemove,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      size={560}
      title={formatMessage(messages.cropImage)}
      primaryAction={{
        label: formatMessage(messages.done),
        onPress: onClose,
      }}
    >
      <ImageCropperContainer
        image={image}
        onComplete={onCrop}
        aspectRatioWidth={aspectRatioWidth}
        aspectRatioHeight={aspectRatioHeight}
        onRemove={() => {
          onRemove();
          onClose();
        }}
      />
    </Modal>
  );
};

export default ImageCropModal;
