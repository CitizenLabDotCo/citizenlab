import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IUpdatedPhaseProperties } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';

import DatePhasePicker from 'components/admin/DatePickers/DatePhasePicker';
import { rangesValid } from 'components/admin/DatePickers/DatePhasePicker/Calendar/utils/rangesValid';
import { isSelectedRangeOpenEnded } from 'components/admin/DatePickers/DatePhasePicker/isSelectedRangeOpenEnded';
import { patchDisabledRanges } from 'components/admin/DatePickers/DatePhasePicker/patchDisabledRanges';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { convertToTimeZoneISO, getDateInTimezone } from 'utils/dateUtils';
import { useParams } from 'utils/router';

import {
  adjustEndForDisplay,
  getDefaultMonth,
} from '../../../../phaseSetup/components/utils';
import phaseSetupMessages from '../../../../phaseSetup/messages';
import { ValidationErrors } from '../../../../phaseSetup/typings';

import PanelField from './PanelField';

interface Props {
  formData: IUpdatedPhaseProperties;
  errors: CLErrors | null;
  validationErrors: ValidationErrors;
  standalone: boolean;
  onChange: (
    dates: Pick<IUpdatedPhaseProperties, 'start_at' | 'end_at'>
  ) => void;
}

/**
 * Deliberately separate from `phaseSetup`'s `DateSetup` rather than shared:
 * both wire the same picker, but that one is built for the full-width form
 * and drives its submit state directly, while this one has to fit the panel
 * and only reports the dates back. The rules they must agree on live in the
 * helpers below, so they cannot drift apart on the parts that matter.
 */
const PhaseDates = ({
  formData,
  errors,
  validationErrors,
  standalone,
  onChange,
}: Props) => {
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

  // Between phase switches the ranges can briefly be inconsistent; wait for
  // them to settle rather than rendering a picker that cannot draw them.
  if (!rangesValid(selectedRange, disabledRanges).valid) return null;

  return (
    <PanelField label={<FormattedMessage {...phaseSetupMessages.datesLabel} />}>
      <DatePhasePicker
        selectedRange={selectedRange}
        disabledRanges={disabledRanges}
        defaultMonth={
          getDefaultMonth(selectedRange, disabledRanges) ?? undefined
        }
        startMonth={new Date(1900, 1, 1)}
        onUpdateRange={({ from, to }) =>
          onChange({
            start_at: convertToTimeZoneISO(from, timeZone),
            end_at: to ? convertToTimeZoneISO(to, timeZone) : null,
          })
        }
        className="intercom-admin-phase-date-setup"
      />
      <Error apiErrors={errors?.start_at} />
      <Error apiErrors={errors?.end_at} />
      <Error text={validationErrors.phaseDateError} />

      {isSelectedRangeOpenEnded(selectedRange, disabledRanges) && (
        <Box mt="16px">
          <Warning>
            <>
              <FormattedMessage {...phaseSetupMessages.noEndDateWarningTitle} />
              <ul>
                <li>
                  <FormattedMessage
                    {...phaseSetupMessages.noEndDateWarningBullet1}
                  />
                </li>
                <li>
                  <FormattedMessage
                    {...phaseSetupMessages.noEndDateWarningBullet2}
                  />
                </li>
              </ul>
            </>
          </Warning>
        </Box>
      )}
    </PanelField>
  );
};

export default PhaseDates;
