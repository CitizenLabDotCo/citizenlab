import React from 'react';

import { Input, Toggle } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import eventMessages from 'containers/Admin/projects/project/events/messages';
import { EventForm } from 'containers/Admin/projects/project/events/useEventForm';

import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SetupCard from './SetupCard';

interface Props {
  form: EventForm;
}

const RegistrationCard = ({ form }: Props) => {
  const { formatMessage } = useIntl();
  const { attributes, errors } = form;

  return (
    <SetupCard title={formatMessage(messages.registration)}>
      <Toggle
        label={formatMessage(eventMessages.toggleRegistrationLimitLabel)}
        checked={form.registrationLimitOn}
        onChange={form.toggleRegistrationLimit}
      />
      {form.registrationLimitOn && (
        <>
          <Input
            id="maximum_attendees"
            label={formatMessage(eventMessages.maximumRegistrants)}
            type="number"
            value={attributes.maximum_attendees?.toString()}
            onChange={form.setMaximumAttendees}
          />
          <Error
            fieldName="maximum_attendees"
            apiErrors={errors?.maximum_attendees}
          />
        </>
      )}

      <Toggle
        label={formatMessage(eventMessages.toggleCustomRegisterButtonLabel)}
        checked={form.customButtonOn}
        onChange={form.toggleCustomButton}
      />
      {form.customButtonOn && (
        <>
          <Input
            id="event-custom-button-link"
            label={formatMessage(eventMessages.customButtonLink)}
            labelTooltipText={formatMessage(
              eventMessages.customButtonLinkTooltip
            )}
            type="text"
            value={attributes.using_url}
            placeholder="https://..."
            onChange={(using_url: string) =>
              form.updateAttributes({ using_url })
            }
          />
          <Error apiErrors={errors?.using_url} />
          <InputMultilocWithLocaleSwitcher
            id="event-custom-button-text"
            type="text"
            label={formatMessage(eventMessages.customButtonText)}
            labelTooltipText={formatMessage(
              eventMessages.customButtonTextTooltip3
            )}
            valueMultiloc={attributes.attend_button_multiloc}
            onChange={(attend_button_multiloc: Multiloc) =>
              form.updateAttributes({ attend_button_multiloc })
            }
            maxCharCount={28}
          />
        </>
      )}
    </SetupCard>
  );
};

export default RegistrationCard;
