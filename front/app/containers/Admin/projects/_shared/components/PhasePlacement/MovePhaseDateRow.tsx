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
import { PhaseDateError } from './utils';

interface Props {
  phase: IPhaseData;
  defaultOpen: boolean;
  errors: PhaseDateError[];
  onChange: (dates: PlacementDates) => void;
}

const MovePhaseDateRow = ({ phase, defaultOpen, errors, onChange }: Props) => {
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

  const boundaryDate = (date: string) =>
    formatDate(date, { dateStyle: 'medium', timeStyle: 'short', timeZone });
  const errorText = (error: PhaseDateError) => {
    switch (error.type) {
      case 'startRequired':
        return formatMessage(messages.startRequired);
      case 'endInvalid':
        return formatMessage(messages.endInvalid);
      case 'endBeforeStart':
        return formatMessage(messages.endBeforeStart);
      case 'durationTooShort':
        return formatMessage(messages.durationTooShort);
    }

    const phaseName = localize(error.phase.attributes.title_multiloc);
    const otherStart = error.phase.attributes.start_at;
    const otherEnd = error.phase.attributes.end_at;

    if (error.type === 'endRequired') {
      return formatMessage(messages.endRequired2, {
        phaseName,
        date: boundaryDate(otherStart),
      });
    }
    if (Date.parse(start_at) < Date.parse(otherStart)) {
      return formatMessage(messages.overlapEndBefore, {
        phaseName,
        date: boundaryDate(otherStart),
      });
    }
    if (otherEnd) {
      return formatMessage(messages.overlapStartAfter, {
        phaseName,
        date: boundaryDate(otherEnd),
      });
    }
    return formatMessage(messages.overlapOpenEnded, { phaseName });
  };

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
        {errors.map((error) => (
          <Error
            key={
              'phase' in error ? `${error.type}-${error.phase.id}` : error.type
            }
            text={errorText(error)}
          />
        ))}
      </Box>
    </PanelGroup>
  );
};

export default MovePhaseDateRow;
