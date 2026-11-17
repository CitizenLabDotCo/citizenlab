import React from 'react';

import { Multiloc } from 'typings';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import { EventForm } from 'containers/Admin/projects/_shared/events/useEventForm';
import eventMessages from 'containers/Admin/projects/project/events/messages';

import MultilocTextField from 'components/admin/MultilocFields/MultilocTextField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import NumberField from 'design-system/NumberField';
import Switch from 'design-system/Switch';
import TextField from 'design-system/TextField';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  form: EventForm;
}

const RegistrationCard = ({ form }: Props) => {
  const { formatMessage } = useIntl();
  const { attributes, errors } = form;
  const apiErrorText = useApiErrorText();
  const maximumAttendeesError = apiErrorText(
    errors?.maximum_attendees,
    'maximum_attendees'
  );
  const usingUrlError = apiErrorText(errors?.using_url);

  return (
    <SetupCard title={formatMessage(messages.registration)}>
      <Switch
        size={26}
        isSelected={form.registrationLimitOn}
        onChange={form.toggleRegistrationLimit}
      >
        {formatMessage(eventMessages.toggleRegistrationLimitLabel)}
      </Switch>
      {form.registrationLimitOn && (
        <NumberField
          id="maximum_attendees"
          label={formatMessage(eventMessages.maximumRegistrants)}
          value={attributes.maximum_attendees ?? NaN}
          // An empty field gives NaN, which the form counts as 0.
          onChange={(value) =>
            form.setMaximumAttendees(Number.isNaN(value) ? '' : String(value))
          }
          isInvalid={!!maximumAttendeesError}
          errorMessage={maximumAttendeesError}
        />
      )}

      <Switch
        size={26}
        isSelected={form.customButtonOn}
        onChange={form.toggleCustomButton}
      >
        {formatMessage(eventMessages.toggleCustomRegisterButtonLabel)}
      </Switch>
      {form.customButtonOn && (
        <>
          <TextField
            id="event-custom-button-link"
            label={formatMessage(eventMessages.customButtonLink)}
            description={formatMessage(eventMessages.customButtonLinkTooltip)}
            value={attributes.using_url ?? ''}
            placeholder="https://..."
            onChange={(using_url) => form.updateAttributes({ using_url })}
            isInvalid={!!usingUrlError}
            errorMessage={usingUrlError}
          />
          <MultilocTextField
            id="event-custom-button-text"
            label={formatMessage(eventMessages.customButtonText)}
            description={formatMessage(eventMessages.customButtonTextTooltip3)}
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
