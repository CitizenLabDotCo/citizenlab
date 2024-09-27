import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';

import DatePhasePicker from 'components/admin/DatePhasePicker';
import { rangesValid } from 'components/admin/DatePhasePicker/Calendar/utils/rangesValid';
import { isSelectedRangeOpenEnded } from 'components/admin/DatePhasePicker/isSelectedRangeOpenEnded';
import { patchDisabledRanges } from 'components/admin/DatePhasePicker/patchDisabledRanges';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { SubmitStateType } from '../typings';

import { getDefaultMonth } from './utils';

interface Props {
  formData: IUpdatedPhaseProperties;
  errors: CLErrors | null;
  setSubmitState: React.Dispatch<React.SetStateAction<SubmitStateType>>;
  setFormData: React.Dispatch<React.SetStateAction<IUpdatedPhaseProperties>>;
}

const DateSetup = ({
  formData,
  errors,
  setFormData,
  setSubmitState,
}: Props) => {
  const { projectId, phaseId } = useParams();
  const { data: phases } = usePhases(projectId);

  const { start_at, end_at } = formData;

  const selectedRange = useMemo(
    () => ({
      from: start_at ? new Date(start_at) : undefined,
      to: end_at ? new Date(end_at) : undefined,
    }),
    [start_at, end_at]
  );

  const disabledRanges = useMemo(() => {
    if (!phases) return undefined;

    const otherPhases = phases.data.filter((phase) => phase.id !== phaseId);
    const disabledRanges = otherPhases.map(
      ({ attributes: { start_at, end_at } }) => ({
        from: new Date(start_at),
        to: end_at ? new Date(end_at) : undefined,
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
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.datesLabel} />
      </SubSectionTitle>
      <DatePhasePicker
        selectedRange={selectedRange}
        disabledRanges={disabledRanges}
        defaultMonth={defaultMonth ?? undefined}
        onUpdateRange={({ from, to }) => {
          setSubmitState('enabled');
          setFormData({
            ...formData,
            start_at: from ? format(from, 'yyyy-MM-dd') : undefined,
            end_at: to ? format(to, 'yyyy-MM-dd') : undefined,
          });
        }}
      />
      <Error apiErrors={errors && errors.start_at} />
      <Error apiErrors={errors && errors.end_at} />
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
