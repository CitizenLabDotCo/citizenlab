import React from 'react';

import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';

import { FormattedMessage } from 'utils/cl-intl';

import PhaseDatePicker, {
  PhaseDates as Dates,
} from '../../../../phaseSetup/components/PhaseDatePicker';
import usePhaseDateRanges from '../../../../phaseSetup/components/PhaseDatePicker/usePhaseDateRanges';
import phaseSetupMessages from '../../../../phaseSetup/messages';
import { ValidationErrors } from '../../../../phaseSetup/typings';

import PanelField from './PanelField';

interface Props {
  formData: IUpdatedPhaseProperties;
  errors: CLErrors | null;
  validationErrors: ValidationErrors;
  standalone: boolean;
  onChange: (dates: Dates) => void;
}

const PhaseDates = ({
  formData,
  errors,
  validationErrors,
  standalone,
  onChange,
}: Props) => {
  const ranges = usePhaseDateRanges({ formData, standalone });

  if (!ranges) return null;

  return (
    <PanelField label={<FormattedMessage {...phaseSetupMessages.datesLabel} />}>
      <PhaseDatePicker
        ranges={ranges}
        errors={errors}
        validationErrors={validationErrors}
        onChange={onChange}
      />
    </PanelField>
  );
};

export default PhaseDates;
