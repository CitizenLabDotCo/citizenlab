import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { parseISO, subDays } from 'date-fns';
import { useParams } from 'react-router-dom';
import { CLErrors } from 'typings';

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

import messages from '../messages';
import { SubmitStateType, ValidationErrors } from '../typings';

import { getDefaultMonth } from './utils';

interface Props {
  formData: IUpdatedPhaseProperties;
  errors: CLErrors | null;
  validationErrors: ValidationErrors;
  setSubmitState: React.Dispatch<React.SetStateAction<SubmitStateType>>;
  setFormData: React.Dispatch<React.SetStateAction<IUpdatedPhaseProperties>>;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

/**
 * Adjusts end dates for calendar display.
 * If a phase ends at midnight (00:00), it visually appears to end on the previous day.
 * This prevents visual overlaps and ensures clean calendar rendering.
 */
const adjustEndForDisplay = (date?: Date) => {
  if (!date) return date;

  const isMidnight =
    date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;

  return isMidnight ? subDays(date, 1) : date;
};

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

  const { start_at, end_at } = formData;

  const selectedRange = useMemo(() => {
    return {
      from: start_at ? parseISO(start_at) : undefined,
      to: end_at ? adjustEndForDisplay(parseISO(end_at)) : undefined,
    };
  }, [start_at, end_at]);

  const disabledRanges = useMemo(() => {
    if (!phases) return [];

    const otherPhases = phases.data.filter((phase) => phase.id !== phaseId);
    const disabledRanges = otherPhases.map(
      ({ attributes: { start_at, end_at } }) => ({
        from: parseISO(start_at),
        to: end_at ? adjustEndForDisplay(parseISO(end_at)) : undefined,
      })
    );

    return patchDisabledRanges(selectedRange, disabledRanges);
  }, [phases, phaseId, selectedRange]);

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
          setFormData({
            ...formData,
            start_at: from ? from.toISOString() : '',
            end_at: to ? to.toISOString() : '',
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
