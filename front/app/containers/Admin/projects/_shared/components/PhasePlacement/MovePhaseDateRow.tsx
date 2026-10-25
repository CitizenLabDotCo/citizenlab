import React from 'react';

import { Box, Input, Text } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { convertToTimeZoneISO, getDateInTimezone } from 'utils/dateUtils';

import PanelGroup from '../SettingsPanel/PanelGroup';

import messages from './messages';
import { PlacementDates } from './usePhasePlacementMove';

interface Props {
  phase: IPhaseData;
  defaultOpen: boolean;
  invalid: boolean;
  onChange: (dates: PlacementDates) => void;
}

const MovePhaseDateRow = ({ phase, defaultOpen, invalid, onChange }: Props) => {
  const { data: configuration } = useAppConfiguration();
  const timeZone = configuration?.data.attributes.settings.core.timezone;
  const { formatMessage, formatDate } = useIntl();
  const localize = useLocalize();
  const title = localize(phase.attributes.title_multiloc);
  const { start_at, end_at } = phase.attributes;
  const from = getDateInTimezone(start_at, timeZone);
  const to = getDateInTimezone(end_at, timeZone);
  const dates = [start_at, end_at]
    .filter((date): date is string => !!date)
    .map((date) => formatDate(date, { dateStyle: 'medium', timeZone }))
    .join(' – ');

  return (
    <PanelGroup label={`${title} · ${dates}`} defaultOpen={defaultOpen}>
      <Box px="12px">
        <Box display="flex" gap="12px">
          <Box flex="1">
            <Input
              id={`move-start-${phase.id}`}
              type="datetime-local"
              variant="bo"
              label={formatMessage(messages.startDate)}
              ariaLabel={`${formatMessage(messages.startDate)} · ${title}`}
              value={from ? format(from, "yyyy-MM-dd'T'HH:mm") : ''}
              disabled={!timeZone}
              onChange={(value) =>
                onChange({
                  start_at: value
                    ? convertToTimeZoneISO(new Date(value), timeZone)
                    : '',
                  end_at,
                })
              }
            />
          </Box>
          <Box flex="1">
            <Input
              id={`move-end-${phase.id}`}
              type="datetime-local"
              variant="bo"
              label={formatMessage(messages.endDate)}
              ariaLabel={`${formatMessage(messages.endDate)} · ${title}`}
              value={to ? format(to, "yyyy-MM-dd'T'HH:mm") : ''}
              disabled={!timeZone}
              onChange={(value) =>
                onChange({
                  start_at,
                  end_at: value
                    ? convertToTimeZoneISO(new Date(value), timeZone)
                    : null,
                })
              }
            />
          </Box>
        </Box>
        {timeZone && (
          <Text variant="boMicro">
            {formatMessage(messages.dateTimezone, { timeZone })}
          </Text>
        )}
        {invalid && (
          <Error
            text={formatMessage(messages.invalidDates, { phaseName: title })}
          />
        )}
      </Box>
    </PanelGroup>
  );
};

export default MovePhaseDateRow;
