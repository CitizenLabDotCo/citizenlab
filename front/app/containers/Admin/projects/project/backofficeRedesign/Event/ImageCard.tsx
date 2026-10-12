import React, { useState } from 'react';

import { UploadFile } from 'typings';

import { EventForm } from 'containers/Admin/projects/project/events/useEventForm';

import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import ImageCropModal from './ImageCropModal';
import ImageFileRow from './ImageFileRow';
import messages from './messages';
import SetupCard from './SetupCard';

interface Props {
  form: EventForm;
}

const ImageCard = ({ form }: Props) => {
  const { formatMessage } = useIntl();
  const [cropOpen, setCropOpen] = useState(false);

  // A new image has to be cropped to 3:1 before it is saved.
  const addImage = (images: UploadFile[]) => {
    form.addImage(images);
    setCropOpen(true);
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
          <InputMultilocWithLocaleSwitcher
            id="event-image-alt-text"
            type="text"
            variant="bo"
            valueMultiloc={form.imageAltText}
            label={formatMessage(messages.altText)}
            placeholder={formatMessage(messages.altTextPlaceholder)}
            onChange={form.changeImageAltText}
          />
        </>
      ) : (
        <ImagesDropzone
          images={[]}
          acceptedFileTypes={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}
          onAdd={addImage}
          onRemove={form.removeImage}
          imagePreviewRatio={1 / 3}
          label={formatMessage(messages.dropImage)}
          compact
        />
      )}
      <ImageCropModal
        opened={cropOpen && form.imageNeedsCrop}
        image={form.image}
        onCrop={form.cropImage}
        onRemove={form.removeImage}
        onClose={() => setCropOpen(false)}
      />
    </SetupCard>
  );
};

export default ImageCard;
