import React from 'react';

import { Multiloc } from 'typings';

import AttachmentsCard from 'containers/Admin/projects/_shared/components/AttachmentsCard';
import { EventForm } from 'containers/Admin/projects/_shared/events/useEventForm';
import eventMessages from 'containers/Admin/projects/project/events/messages';

import MultilocRichTextField from 'components/admin/MultilocFields/MultilocRichTextField';
import MultilocTextField from 'components/admin/MultilocFields/MultilocTextField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import Banner from 'design-system/Banner';

import { useIntl } from 'utils/cl-intl';

import DeleteEventButton from './DeleteEventButton';
import EventDates from './EventDates';
import styles from './EventSetup.module.css';
import ImageCard from './ImageCard';
import LocationCard from './LocationCard';
import messages from './messages';
import RegistrationCard from './RegistrationCard';
import 'design-system/tokens.css';

interface Props {
  projectId: string;
  form: EventForm;
}

const EventSetup = ({ projectId, form }: Props) => {
  const { formatMessage } = useIntl();
  const { attributes, errors } = form;
  const apiErrorText = useApiErrorText();
  const titleError = apiErrorText(errors?.title_multiloc, 'title_multiloc');
  const descriptionError = apiErrorText(
    errors?.description_multiloc,
    'description_multiloc'
  );
  const baseError = apiErrorText(errors?.base, 'base');

  return (
    <div className={styles.setup}>
      <h2 className={styles.title}>{formatMessage(messages.eventSetup)}</h2>

      <div className={styles.texts}>
        <MultilocTextField
          id="event-title"
          aria-label={formatMessage(eventMessages.titleLabel)}
          placeholder={formatMessage(messages.addEventName)}
          valueMultiloc={attributes.title_multiloc}
          onChange={(title_multiloc: Multiloc) =>
            form.updateAttributes({ title_multiloc })
          }
          errorMessage={titleError}
        />

        <MultilocRichTextField
          id="event-description"
          aria-label={formatMessage(eventMessages.descriptionLabel)}
          placeholder={formatMessage(messages.addDescription)}
          valueMultiloc={attributes.description_multiloc}
          onChange={(description_multiloc: Multiloc) =>
            form.updateAttributes({ description_multiloc })
          }
          errorMessage={descriptionError}
          withCTAButton
        />
      </div>

      <div className={styles.cards}>
        <AttachmentsCard
          id="event-file-uploader"
          title={formatMessage(messages.attachments)}
          files={form.files}
          errors={errors}
          disabled={form.saving}
        />

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
      </div>

      {baseError && <Banner tone="error">{baseError}</Banner>}

      {form.event ? (
        <DeleteEventButton projectId={projectId} eventId={form.event.id} />
      ) : (
        <div className={styles.bottomSpace} />
      )}
    </div>
  );
};

export default EventSetup;
