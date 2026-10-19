import React from 'react';

import { Input, Text, Toggle } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { EventForm } from 'containers/Admin/projects/_shared/events/useEventForm';
import eventMessages from 'containers/Admin/projects/project/events/messages';

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
        size="small"
        label={
          <Text as="span" variant="boControl" m="0">
            {formatMessage(eventMessages.toggleRegistrationLimitLabel)}
          </Text>
        }
        checked={form.registrationLimitOn}
        onChange={form.toggleRegistrationLimit}
      />
      {form.registrationLimitOn && (
        <>
          <Input
            id="maximum_attendees"
            variant="bo"
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
        size="small"
        label={
          <Text as="span" variant="boControl" m="0">
            {formatMessage(eventMessages.toggleCustomRegisterButtonLabel)}
          </Text>
        }
        checked={form.customButtonOn}
        onChange={form.toggleCustomButton}
      />
      {form.customButtonOn && (
        <>
          <Input
            id="event-custom-button-link"
            variant="bo"
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
            variant="bo"
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
