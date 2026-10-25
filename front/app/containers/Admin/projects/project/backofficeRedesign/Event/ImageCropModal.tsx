import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  opened: boolean;
  image: UploadFile | null;
  onCrop: (croppedImage: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

const ImageCropModal = ({
  opened,
  image,
  onCrop,
  onRemove,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      variant="bo"
      opened={opened}
      close={onClose}
      header={formatMessage(messages.cropImage)}
      footer={
        <Box display="flex" justifyContent="flex-end" w="100%">
          <Button buttonStyle="bo-primary" onClick={onClose}>
            {formatMessage(messages.done)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <ImageCropperContainer
          image={image}
          onComplete={onCrop}
          aspectRatioWidth={3}
          aspectRatioHeight={1}
          onRemove={() => {
            onRemove();
            onClose();
          }}
        />
      </Box>
    </Modal>
  );
};

export default ImageCropModal;
