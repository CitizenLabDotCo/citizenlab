import React from 'react';

import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';

import PhaseDatePicker, {
  PhaseDates as Dates,
} from 'containers/Admin/projects/project/phaseSetup/components/PhaseDatePicker';
import usePhaseDateRanges from 'containers/Admin/projects/project/phaseSetup/components/PhaseDatePicker/usePhaseDateRanges';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import { FormattedMessage } from 'utils/cl-intl';

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
