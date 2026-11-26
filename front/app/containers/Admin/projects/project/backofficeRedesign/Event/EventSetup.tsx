import React from 'react';

import { Multiloc } from 'typings';

import Banner from 'design-system/Banner';

import AttachmentsCard from 'containers/Admin/projects/_shared/components/AttachmentsCard';
import eventMessages from 'containers/Admin/projects/project/events/messages';

import LanguageGroup from 'components/admin/MultilocFields/LanguageGroup';
import fieldMessages from 'components/admin/MultilocFields/messages';
import MultilocRichTextField from 'components/admin/MultilocFields/MultilocRichTextField';
import MultilocTextField from 'components/admin/MultilocFields/MultilocTextField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import useLanguageGroup from 'components/admin/MultilocFields/useLanguageGroup';

import { useIntl } from 'utils/cl-intl';

import DeleteEventButton from './DeleteEventButton';
import EventDates from './EventDates';
import styles from './EventSetup.module.css';
import ImageCard from './ImageCard';
import LocationCard from './LocationCard';
import messages from './messages';
import RegistrationCard from './RegistrationCard';
import { EventForm } from './useEventForm';
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
  const group = useLanguageGroup([
    {
      value: attributes.title_multiloc,
      name: formatMessage(messages.nameField),
      required: true,
    },
    {
      value: attributes.description_multiloc,
      name: formatMessage(fieldMessages.description),
    },
  ]);

  return (
    <div className={styles.setup}>
      <h2 className={styles.title}>{formatMessage(messages.eventSetup)}</h2>

      <LanguageGroup
        group={group}
        aria-label={formatMessage(messages.eventContentLanguage)}
      >
        <MultilocTextField
          id="event-title"
          locale={group.selectedLocale}
          aria-label={formatMessage(eventMessages.titleLabel)}
          placeholder={group.placeholder(
            messages.addEventNameInLanguage,
            messages.addEventName
          )}
          valueMultiloc={attributes.title_multiloc}
          onChange={(title_multiloc: Multiloc) =>
            form.updateAttributes({ title_multiloc })
          }
          errorMessage={titleError}
        />

        <MultilocRichTextField
          id="event-description"
          locale={group.selectedLocale}
          aria-label={formatMessage(eventMessages.descriptionLabel)}
          placeholder={group.placeholder(
            messages.addDescriptionInLanguage,
            messages.addDescription
          )}
          valueMultiloc={attributes.description_multiloc}
          onChange={(description_multiloc: Multiloc) =>
            form.updateAttributes({ description_multiloc })
          }
          errorMessage={descriptionError}
          withCTAButton
        />
      </LanguageGroup>

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
