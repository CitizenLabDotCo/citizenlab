import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { format, parseISO, startOfDay } from 'date-fns';
import { useParams } from 'utils/router';
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

const DateSetup = ({
  formData,
  errors,
  validationErrors,
  setFormData,
  setSubmitState,
  setValidationErrors,
}: Props) => {
  const { projectId, phaseId } = useParams({ strict: false });
  const { data: phases } = usePhases(projectId);

  const { start_at, end_at } = formData;

  const selectedRange = useMemo(() => {
    return {
      from: start_at ? startOfDay(parseISO(start_at)) : undefined,
      to: end_at ? startOfDay(parseISO(end_at)) : undefined,
    };
  }, [start_at, end_at]);

  const disabledRanges = useMemo(() => {
    if (!phases) return undefined;

    const otherPhases = phases.data.filter((phase) => phase.id !== phaseId);
    const disabledRanges = otherPhases.map(
      ({ attributes: { start_at, end_at } }) => ({
        from: startOfDay(parseISO(start_at)),
        to: end_at ? startOfDay(parseISO(end_at)) : undefined,
      })
    );

    return patchDisabledRanges(selectedRange, disabledRanges);
  }, [phases, phaseId, selectedRange]);

  if (!phases || !disabledRanges) return null;

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
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            start_at: from ? format(from, 'yyyy-MM-dd') : '',
            end_at: to ? format(to, 'yyyy-MM-dd') : '',
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
