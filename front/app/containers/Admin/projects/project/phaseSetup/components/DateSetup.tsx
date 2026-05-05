import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { CLErrors } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IUpdatedPhaseProperties } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';

import DatePhasePicker from 'components/admin/DatePickers/DatePhasePicker';
import { rangesValid } from 'components/admin/DatePickers/DatePhasePicker/Calendar/utils/rangesValid';
import { isSelectedRangeOpenEnded } from 'components/admin/DatePickers/DatePhasePicker/isSelectedRangeOpenEnded';
import { patchDisabledRanges } from 'components/admin/DatePickers/DatePhasePicker/patchDisabledRanges';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { convertToTimeZoneISO, getDateInTimezone } from 'utils/dateUtils';

import messages from '../messages';
import { SubmitStateType, ValidationErrors } from '../typings';

import { getDefaultMonth, adjustEndForDisplay } from './utils';

interface Props {
  formData: IUpdatedPhaseProperties;
  errors: CLErrors | null;
  validationErrors: ValidationErrors;
  setSubmitState: React.Dispatch<React.SetStateAction<SubmitStateType>>;
  setFormData: React.Dispatch<React.SetStateAction<IUpdatedPhaseProperties>>;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const DateSetup = ({
  formData,
  errors,
  validationErrors,
  setFormData,
  setSubmitState,
  setValidationErrors,
}: Props) => {
  const { projectId, phaseId } = useParams();
  const { data: phases } = usePhases(projectId);

  const { data: tenant } = useAppConfiguration();
  const timeZone = tenant?.data.attributes.settings.core.timezone;

  const { start_at, end_at } = formData;

  const selectedRange = useMemo(() => {
    return {
      from: getDateInTimezone(start_at, timeZone),
      to: getDateInTimezone(end_at, timeZone),
    };
  }, [start_at, end_at, timeZone]);

  const disabledRanges = useMemo(() => {
    if (!phases || !timeZone) return [];

    const otherPhases = phases.data.filter((phase) => phase.id !== phaseId);
    const disabledRanges = otherPhases
      .map(({ attributes: { start_at, end_at } }) => {
        const fromDate = getDateInTimezone(start_at, timeZone);
        const toDate = end_at ? getDateInTimezone(end_at, timeZone) : undefined;

        return {
          from: fromDate,
          to: toDate ? adjustEndForDisplay(toDate) : undefined,
        };
      })
      .filter(
        (range): range is { from: Date; to: Date | undefined } =>
          range.from !== undefined
      );

    return patchDisabledRanges(selectedRange, disabledRanges);
  }, [phases, phaseId, selectedRange, timeZone]);

  if (!phases) return null;

  const selectedRangeIsOpenEnded = isSelectedRangeOpenEnded(
    selectedRange,
    disabledRanges
  );

  const { valid } = rangesValid(selectedRange, disabledRanges);

  if (!valid) {
    // Sometimes, in between switching phases, the ranges
    // might become temporarily invalid. In this case,
    // we wait for them to become valid first.
    return null;
  }

  const defaultMonth = getDefaultMonth(selectedRange, disabledRanges);

  return (
    <SectionField className="intercom-admin-phase-date-setup">
      <SubSectionTitle>
        <FormattedMessage {...messages.datesLabel} />
      </SubSectionTitle>
      <DatePhasePicker
        selectedRange={selectedRange}
        disabledRanges={disabledRanges}
        defaultMonth={defaultMonth ?? undefined}
        startMonth={new Date(1900, 1, 1)}
        onUpdateRange={({ from, to }) => {
          setSubmitState('enabled');
          setValidationErrors((prevState) => ({
            ...prevState,
            phaseDateError: undefined,
          }));

          const start_at = convertToTimeZoneISO(from, timeZone);
          const end_at = to ? convertToTimeZoneISO(to, timeZone) : null;
          setFormData({
            ...formData,
            start_at,
            end_at,
          });
        }}
        className="intercom-admin-phase-date-setup"
      />
      <Error apiErrors={errors && errors.start_at} />
      <Error apiErrors={errors && errors.end_at} />
      <Error text={validationErrors.phaseDateError} />
      {selectedRangeIsOpenEnded && (
        <Box mt="24px">
          <Warning>
            <>
              <FormattedMessage {...messages.noEndDateWarningTitle} />
              <ul>
                <li>
                  <FormattedMessage {...messages.noEndDateWarningBullet1} />
                </li>
                <li>
                  <FormattedMessage {...messages.noEndDateWarningBullet2} />
                </li>
              </ul>
            </>
          </Warning>
        </Box>
      )}
    </SectionField>
  );
};

export default DateSetup;
