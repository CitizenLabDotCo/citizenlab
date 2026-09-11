import React from 'react';

import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { SubmitStateType, ValidationErrors } from '../typings';

import PhaseDatePicker from './PhaseDatePicker';
import usePhaseDateRanges from './PhaseDatePicker/usePhaseDateRanges';

interface Props {
  formData: IUpdatedPhaseProperties;
  errors: CLErrors | null;
  validationErrors: ValidationErrors;
  standalone?: boolean;
  setSubmitState: React.Dispatch<React.SetStateAction<SubmitStateType>>;
  setFormData: React.Dispatch<React.SetStateAction<IUpdatedPhaseProperties>>;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const DateSetup = ({
  formData,
  errors,
  validationErrors,
  standalone,
  setFormData,
  setSubmitState,
  setValidationErrors,
}: Props) => {
  const ranges = usePhaseDateRanges({ formData, standalone });

  if (!ranges) return null;

  return (
    <SectionField className="intercom-admin-phase-date-setup">
      <SubSectionTitle>
        <FormattedMessage {...messages.datesLabel} />
      </SubSectionTitle>
      <PhaseDatePicker
        ranges={ranges}
        errors={errors}
        validationErrors={validationErrors}
        onChange={(dates) => {
          setSubmitState('enabled');
          setValidationErrors((errors) => ({
            ...errors,
            phaseDateError: undefined,
          }));
          setFormData((formData) => ({ ...formData, ...dates }));
        }}
      />
    </SectionField>
  );
};

export default DateSetup;
