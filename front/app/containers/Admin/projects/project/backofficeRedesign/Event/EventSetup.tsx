import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import eventMessages from 'containers/Admin/projects/project/events/messages';
import { EventForm } from 'containers/Admin/projects/project/events/useEventForm';

import Error from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import PanelHeading from '../ProjectSetupPanel/PanelHeading';

import DeleteEventButton from './DeleteEventButton';
import EventDates from './EventDates';
import ImageCard from './ImageCard';
import LocationCard from './LocationCard';
import messages from './messages';
import RegistrationCard from './RegistrationCard';
import SetupCard from './SetupCard';

interface Props {
  projectId: string;
  form: EventForm;
}

const EventSetup = ({ projectId, form }: Props) => {
  const { formatMessage } = useIntl();
  const { attributes, errors } = form;

  return (
    <Box display="flex" flexDirection="column" gap="16px" p="20px">
      <PanelHeading title={formatMessage(messages.eventSetup)} />

      <Box>
        <InputMultilocWithLocaleSwitcher
          id="event-title"
          type="text"
          label={formatMessage(eventMessages.titleLabel)}
          valueMultiloc={attributes.title_multiloc}
          onChange={(title_multiloc: Multiloc) =>
            form.updateAttributes({ title_multiloc })
          }
        />
        <Error apiErrors={errors?.title_multiloc} />
      </Box>

      <Box>
        <QuillMultilocWithLocaleSwitcher
          id="event-description"
          label={formatMessage(eventMessages.descriptionLabel)}
          valueMultiloc={attributes.description_multiloc}
          onChange={(description_multiloc: Multiloc) =>
            form.updateAttributes({ description_multiloc })
          }
          withCTAButton
        />
        <Error apiErrors={errors?.description_multiloc} />
      </Box>

      <SetupCard title={formatMessage(messages.attachments)}>
        <FileRepositorySelectAndUpload
          id="event-file-uploader"
          onFileAdd={form.files.uploadFile}
          onFileRemove={form.files.removeFile}
          onFileReorder={form.files.reorderFiles}
          onFileAttach={form.files.attachFile}
          fileAttachments={form.files.attachments}
          enableDragAndDrop
          apiErrors={errors}
          maxSizeMb={10}
          isUploadingFile={form.files.isUploadingFile}
        />
      </SetupCard>

      <ImageCard form={form} />

      {attributes.start_at && attributes.end_at && (
        <EventDates
          startAt={attributes.start_at}
          endAt={attributes.end_at}
          errors={errors}
          setAttributeDiff={form.updateAttributeDiff}
        />
      )}

      <LocationCard form={form} />

      <RegistrationCard form={form} />

      {form.event && (
        <DeleteEventButton projectId={projectId} eventId={form.event.id} />
      )}

      <Error apiErrors={errors?.base} />
    </Box>
  );
};

export default EventSetup;
