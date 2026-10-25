import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import DatePhasePicker from 'components/admin/DatePickers/DatePhasePicker';
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
        <DatePhasePicker
          selectedRange={{ from, to }}
          defaultMonth={from}
          onUpdateRange={({ from, to }) => {
            const start = convertToTimeZoneISO(from, timeZone);
            if (!start) return;

            onChange({
              start_at: start,
              end_at: to ? convertToTimeZoneISO(to, timeZone) : null,
            });
          }}
        />
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
