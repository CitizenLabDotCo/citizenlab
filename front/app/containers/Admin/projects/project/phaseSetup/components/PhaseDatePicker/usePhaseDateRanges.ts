import { useMemo } from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IUpdatedPhaseProperties } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';
import { rangesValid } from 'components/admin/DatePickers/DatePhasePicker/Calendar/utils/rangesValid';
import { patchDisabledRanges } from 'components/admin/DatePickers/DatePhasePicker/patchDisabledRanges';

import { getDateInTimezone } from 'utils/dateUtils';
import { useParams } from 'utils/router';

import { adjustEndForDisplay, getDefaultMonth } from '../utils';

export interface PhaseDateRanges {
  selectedRange: Partial<DateRange>;
  disabledRanges: DateRange[];
  defaultMonth: Date | undefined;
  timeZone: string | undefined;
}

interface Options {
  formData: IUpdatedPhaseProperties;
  standalone?: boolean;
}

/**
 * The ranges the phase date picker draws. Returns nothing until they are
 * consistent: in between switching phases they can briefly disagree, and the
 * picker cannot draw them then.
 */
const usePhaseDateRanges = ({
  formData,
  standalone,
}: Options): PhaseDateRanges | null => {
  const { projectId, phaseId } = useParams({ strict: false });
  const { data: phases } = usePhases(projectId);
  const { data: tenant } = useAppConfiguration();
  const timeZone = tenant?.data.attributes.settings.core.timezone;

  const { start_at, end_at } = formData;

  const selectedRange = useMemo(
    () => ({
      from: getDateInTimezone(start_at, timeZone),
      to: getDateInTimezone(end_at, timeZone),
    }),
    [start_at, end_at, timeZone]
  );

  const disabledRanges = useMemo(() => {
    if (standalone || !phases || !timeZone) return [];

    const otherPhases = phases.data
      .filter((phase) => phase.id !== phaseId)
      .map(({ attributes: { start_at, end_at } }) => {
        const to = end_at ? getDateInTimezone(end_at, timeZone) : undefined;

        return {
          from: getDateInTimezone(start_at, timeZone),
          to: to ? adjustEndForDisplay(to) : undefined,
        };
      })
      .filter(
        (range): range is { from: Date; to: Date | undefined } =>
          range.from !== undefined
      );

    return patchDisabledRanges(selectedRange, otherPhases);
  }, [phases, phaseId, selectedRange, timeZone, standalone]);

  if (!phases) return null;
  if (!rangesValid(selectedRange, disabledRanges).valid) return null;

  return {
    selectedRange,
    disabledRanges,
    defaultMonth: getDefaultMonth(selectedRange, disabledRanges) ?? undefined,
    timeZone,
  };
};

export default usePhaseDateRanges;
