import React from 'react';

import eventMessages from 'containers/Admin/projects/project/events/messages';
import { EventForm } from 'containers/Admin/projects/project/events/useEventForm';
import projectMessages from 'containers/Admin/projects/project/general/messages';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SetupCard from './SetupCard';

interface Props {
  form: EventForm;
}

const ImageCard = ({ form }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <SetupCard title={formatMessage(messages.image)}>
      {form.imageNeedsCrop ? (
        <ImageCropperContainer
          image={form.image}
          onComplete={form.cropImage}
          aspectRatioWidth={3}
          aspectRatioHeight={1}
          onRemove={form.removeImage}
        />
      ) : (
        <ImagesDropzone
          images={form.image ? [form.image] : []}
          objectFit="contain"
          acceptedFileTypes={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}
          onAdd={form.addImage}
          onRemove={form.removeImage}
          imagePreviewRatio={1 / 3}
          label={formatMessage(messages.dropImage)}
          compact
        />
      )}
      {form.image && (
        <InputMultilocWithLocaleSwitcher
          id="event-image-alt-text"
          type="text"
          variant="bo"
          valueMultiloc={form.imageAltText}
          label={formatMessage(eventMessages.eventImageAltTextTitle)}
          labelTooltipText={formatMessage(
            projectMessages.projectImageAltTextTooltip
          )}
          onChange={form.changeImageAltText}
        />
      )}
    </SetupCard>
  );
};

export default ImageCard;
