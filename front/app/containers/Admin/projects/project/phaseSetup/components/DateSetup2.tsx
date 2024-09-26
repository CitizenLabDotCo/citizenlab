import React from 'react';

import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';

import DatePhasePicker from 'components/admin/DatePhasePicker';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { SubmitStateType } from '../typings';

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

  if (!phases) return null;

  const { start_at, end_at } = formData;

  const selectedRange = {
    from: start_at ? new Date(start_at) : undefined,
    to: end_at ? new Date(end_at) : undefined,
  };

  const otherPhases = phases.data.filter((phase) => phase.id !== phaseId);

  const disabledRanges = otherPhases.map(
    ({ attributes: { start_at, end_at } }) => ({
      from: new Date(start_at),
      to: end_at ? new Date(end_at) : undefined,
    })
  );

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.datesLabel} />
      </SubSectionTitle>
      <DatePhasePicker
        selectedRange={selectedRange}
        disabledRanges={disabledRanges}
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
    </SectionField>
  );
};

export default DateSetup;
