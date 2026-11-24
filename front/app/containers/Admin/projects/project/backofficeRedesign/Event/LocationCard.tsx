import React, { lazy, Suspense } from 'react';

import { Multiloc } from 'typings';

import TextField from 'design-system/TextField';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import eventMessages from 'containers/Admin/projects/project/events/messages';

import MultilocTextField from 'components/admin/MultilocFields/MultilocTextField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import { useIntl } from 'utils/cl-intl';

import 'design-system/tokens.css';
import LocationComboBox from './LocationComboBox';
import Text from 'design-system/Text';
import messages from './messages';
import styles from './LocationCard.module.css';
import { EventForm } from './useEventForm';

// Lazy so ArcGIS only loads once the event has a place on the map.
const EventMap = lazy(
  () => import('containers/Admin/projects/project/events/components/EventMap')
);

interface Props {
  form: EventForm;
}

const LocationCard = ({ form }: Props) => {
  const { formatMessage } = useIntl();
  const { attributes, errors } = form;
  const apiErrorText = useApiErrorText();
  const onlineLinkError = apiErrorText(errors?.online_link);
  const addressError = apiErrorText(errors?.address_1);

  return (
    <SetupCard title={formatMessage(eventMessages.eventLocation)}>
      <TextField
        id="event-online-link"
        label={formatMessage(eventMessages.onlineEventLinkLabel)}
        labelTooltip={formatMessage(eventMessages.onlineEventLinkTooltip)}
        value={attributes.online_link ?? ''}
        placeholder="https://..."
        onChange={(online_link) => form.updateAttributes({ online_link })}
        isInvalid={!!onlineLinkError}
        errorMessage={onlineLinkError}
      />

      <LocationComboBox
        label={formatMessage(messages.address)}
        placeholder={formatMessage(eventMessages.searchForLocation)}
        labelTooltip={formatMessage(eventMessages.addressOneTooltip)}
        errorMessage={addressError}
        value={attributes.address_1 ?? ''}
        onChange={(address_1) => form.updateAttributes({ address_1 })}
      />

      <MultilocTextField
        id="event-address-2"
        label={formatMessage(messages.addressDetails)}
        labelTooltip={formatMessage(eventMessages.addressTwoTooltip)}
        placeholder={formatMessage(eventMessages.addressTwoPlaceholder)}
        valueMultiloc={attributes.address_2_multiloc}
        onChange={(address_2_multiloc: Multiloc) =>
          form.updateAttributes({ address_2_multiloc })
        }
      />

      {form.hasLocationPoint && (
        <div className={styles.field}>
          <div>
            <Text variant="body" tone="primary">
              {formatMessage(eventMessages.refineOnMap)}
            </Text>
            <Text variant="ui" tone="secondary">
              {formatMessage(eventMessages.refineOnMapInstructions)}
            </Text>
          </div>
          <Suspense fallback={null}>
            <EventMap
              mapHeight="230px"
              position={form.mapPosition}
              setLocationPoint={form.moveLocationPoint}
            />
          </Suspense>
        </div>
      )}
    </SetupCard>
  );
};

export default LocationCard;
