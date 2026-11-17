import React, { useState } from 'react';

import Banner from 'design-system/Banner';
import DropZone from 'design-system/DropZone';
import 'design-system/tokens.css';
import { UploadFile } from 'typings';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import { EventForm } from 'containers/Admin/projects/_shared/events/useEventForm';

import MultilocTextField from 'components/admin/MultilocFields/MultilocTextField';
import imagesDropzoneMessages from 'components/UI/ImagesDropzone/messages';

import { useIntl } from 'utils/cl-intl';

import ImageCropModal from './ImageCropModal';
import ImageFileRow from './ImageFileRow';
import {
  ACCEPTED_IMAGE_TYPES,
  isImageTooLarge,
  MAX_IMAGE_FILE_SIZE_MB,
  toUploadFile,
} from './imageUpload';
import messages from './messages';

interface Props {
  form: EventForm;
}

const ImageCard = ({ form }: Props) => {
  const { formatMessage } = useIntl();
  const [cropOpen, setCropOpen] = useState(false);
  const [tooLarge, setTooLarge] = useState(false);

  const addImage = (images: UploadFile[]) => {
    form.addImage(images);
    setCropOpen(true);
  };

  const selectImage = async (files: File[]) => {
    if (files.length === 0) return;
    const [file] = files;

    const isTooLarge = isImageTooLarge(file);
    setTooLarge(isTooLarge);
    if (isTooLarge) return;

    addImage([await toUploadFile(file)]);
  };

  return (
    <SetupCard title={formatMessage(messages.image)}>
      {form.image ? (
        <>
          <ImageFileRow
            image={form.image}
            thumbnail={form.croppedImage ?? form.image.base64}
            onCrop={form.imageNeedsCrop ? () => setCropOpen(true) : undefined}
            onReplace={(image) => addImage([image])}
            onRemove={form.removeImage}
          />
          <MultilocTextField
            id="event-image-alt-text"
            label={formatMessage(messages.altText)}
            placeholder={formatMessage(messages.altTextPlaceholder)}
            valueMultiloc={form.imageAltText}
            onChange={form.changeImageAltText}
          />
        </>
      ) : (
        <>
          <DropZone
            aria-label={formatMessage(messages.dropImage)}
            acceptedFileTypes={ACCEPTED_IMAGE_TYPES}
            onSelect={selectImage}
          />
          {tooLarge && (
            <Banner tone="error">
              {formatMessage(imagesDropzoneMessages.errorImageMaxSizeExceeded, {
                maxFileSize: MAX_IMAGE_FILE_SIZE_MB,
              })}
            </Banner>
          )}
        </>
      )}
      <ImageCropModal
        opened={cropOpen && form.imageNeedsCrop}
        aspectRatioWidth={3}
        aspectRatioHeight={1}
        image={form.image}
        onCrop={form.cropImage}
        onRemove={form.removeImage}
        onClose={() => setCropOpen(false)}
      />
    </SetupCard>
  );
};

export default ImageCard;
