import React, { useState } from 'react';

import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';

import { CardButton } from 'containers/Admin/projects/_shared/components/SetupCardButton';
import PhaseDatePicker, {
  PhaseDates as Dates,
} from 'containers/Admin/projects/project/phaseSetup/components/PhaseDatePicker';
import usePhaseDateRanges from 'containers/Admin/projects/project/phaseSetup/components/PhaseDatePicker/usePhaseDateRanges';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import { useIntl } from 'utils/cl-intl';

import DatesSummary from './DatesSummary';
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
  const { formatMessage } = useIntl();
  const [expanded, setExpanded] = useState(false);
  const ranges = usePhaseDateRanges({ formData, standalone });

  if (!ranges) return null;

  const label = formatMessage(phaseSetupMessages.datesLabel);
  const hasError =
    !!errors?.start_at || !!errors?.end_at || !!validationErrors.phaseDateError;
  // Without a start date, or with an error, the picker must stay in sight.
  const forcedOpen = !formData.start_at || hasError;
  const open = expanded || forcedOpen;

  const handleChange = (dates: Dates) => {
    setExpanded(true);
    onChange(dates);
  };

  const toggle: CardButton | undefined = forcedOpen
    ? undefined
    : {
        icon: open ? 'chevron-up' : 'chevron-down',
        expanded: open,
        onClick: () => setExpanded((expanded) => !expanded),
      };

  return (
    <PanelField
      label={label}
      action={
        formData.start_at &&
        !open && (
          <DatesSummary startAt={formData.start_at} endAt={formData.end_at} />
        )
      }
      button={toggle}
    >
      {open && (
        <PhaseDatePicker
          ranges={ranges}
          errors={errors}
          validationErrors={validationErrors}
          onChange={handleChange}
          variant="bo"
        />
      )}
    </PanelField>
  );
};

export default PhaseDates;
