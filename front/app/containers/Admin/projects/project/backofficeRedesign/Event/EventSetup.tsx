import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { EventForm } from 'containers/Admin/projects/_shared/events/useEventForm';
import eventMessages from 'containers/Admin/projects/project/events/messages';

import Error from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import FileSelectOrUploadModal from 'components/UI/FileRepositorySelectAndUpload/components/FileSelectOrUploadModal';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

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
  const hasAttachmentsBody =
    form.files.attachments.length > 0 ||
    form.files.isUploadingFile ||
    !!errors?.file;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="16px"
      minHeight="100%"
      p="24px 18px 0"
    >
      <Text variant="boSection" m="0" mb="4px">
        {formatMessage(messages.eventSetup)}
      </Text>

      <Box display="flex" flexDirection="column" gap="8px">
        <Box>
          <InputMultilocWithLocaleSwitcher
            id="event-title"
            type="text"
            variant="bo"
            ariaLabel={formatMessage(eventMessages.titleLabel)}
            placeholder={formatMessage(messages.addEventName)}
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
            variant="bo"
            minHeight="74px"
            ariaLabel={formatMessage(eventMessages.descriptionLabel)}
            placeholder={formatMessage(messages.addDescription)}
            valueMultiloc={attributes.description_multiloc}
            onChange={(description_multiloc: Multiloc) =>
              form.updateAttributes({ description_multiloc })
            }
            withCTAButton
          />
          <Error apiErrors={errors?.description_multiloc} />
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="12px">
        <SetupCard
          title={formatMessage(messages.attachments)}
          action={
            <FileSelectOrUploadModal
              fileAttachments={form.files.attachments}
              onFileAdd={form.files.uploadFile}
              onFileAttach={form.files.attachFile}
              maxSizeMb={10}
              isDisabled={form.files.isUploadingFile}
              iconOnly
            />
          }
        >
          {hasAttachmentsBody && (
            <FileRepositorySelectAndUpload
              id="event-file-uploader"
              variant="bo"
              onFileAdd={form.files.uploadFile}
              onFileRemove={form.files.removeFile}
              onFileReorder={form.files.reorderFiles}
              onFileAttach={form.files.attachFile}
              fileAttachments={form.files.attachments}
              apiErrors={errors}
              maxSizeMb={10}
              isUploadingFile={form.files.isUploadingFile}
              hideTrigger
            />
          )}
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
      </Box>

      <Error apiErrors={errors?.base} />

      {form.event ? (
        <DeleteEventButton projectId={projectId} eventId={form.event.id} />
      ) : (
        <Box h="8px" />
      )}
    </Box>
  );
};

export default EventSetup;
