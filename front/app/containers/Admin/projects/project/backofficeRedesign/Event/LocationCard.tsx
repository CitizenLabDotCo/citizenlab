import React, { lazy, Suspense } from 'react';

import {
  Box,
  IconTooltip,
  Input,
  Label,
  Text,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import eventMessages from 'containers/Admin/projects/project/events/messages';
import { EventForm } from 'containers/Admin/projects/project/events/useEventForm';

import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import LocationInput, { Option } from 'components/UI/LocationInput';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SetupCard from './SetupCard';

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

  return (
    <SetupCard title={formatMessage(eventMessages.eventLocation)}>
      <Box>
        <Input
          id="event-online-link"
          label={formatMessage(eventMessages.onlineEventLinkLabel)}
          labelTooltipText={formatMessage(eventMessages.onlineEventLinkTooltip)}
          type="text"
          value={attributes.online_link}
          placeholder="https://..."
          onChange={(online_link: string) =>
            form.updateAttributes({ online_link })
          }
        />
        <Error apiErrors={errors?.online_link} />
      </Box>

      <Box>
        <Label htmlFor="event-location-picker">
          {formatMessage(messages.address)}
          <IconTooltip
            content={formatMessage(eventMessages.addressOneTooltip)}
          />
        </Label>
        <LocationInput
          id="event-location-picker"
          className="e2e-event-location-input"
          value={
            attributes.address_1
              ? { value: attributes.address_1, label: attributes.address_1 }
              : null
          }
          onChange={(option: Option | null) =>
            form.updateAttributes({ address_1: option?.value ?? '' })
          }
          placeholder={formatMessage(eventMessages.searchForLocation)}
        />
        <Error apiErrors={errors?.address_1} />
      </Box>

      <InputMultilocWithLocaleSwitcher
        id="event-address-2"
        type="text"
        label={formatMessage(messages.addressDetails)}
        labelTooltipText={formatMessage(eventMessages.addressTwoTooltip)}
        placeholder={formatMessage(eventMessages.addressTwoPlaceholder)}
        valueMultiloc={attributes.address_2_multiloc}
        onChange={(address_2_multiloc: Multiloc) =>
          form.updateAttributes({ address_2_multiloc })
        }
      />

      {form.hasLocationPoint && (
        <Box>
          <Box display="flex" alignItems="center" gap="4px" mb="4px">
            <Text as="span" m="0" color="coolGrey600" fontSize="s">
              {formatMessage(eventMessages.refineOnMap)}
            </Text>
            <IconTooltip
              content={formatMessage(eventMessages.refineOnMapInstructions)}
            />
          </Box>
          <Suspense fallback={null}>
            <EventMap
              mapHeight="230px"
              position={form.mapPosition}
              setLocationPoint={form.moveLocationPoint}
            />
          </Suspense>
        </Box>
      )}
    </SetupCard>
  );
};

export default LocationCard;
