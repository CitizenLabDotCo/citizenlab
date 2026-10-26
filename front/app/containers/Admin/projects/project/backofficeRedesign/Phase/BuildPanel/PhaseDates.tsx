import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';

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

  return (
    <PanelField
      label={label}
      action={
        <Box display="flex" alignItems="center" gap="4px">
          {formData.start_at && !open && (
            <DatesSummary startAt={formData.start_at} endAt={formData.end_at} />
          )}
          {!forcedOpen && (
            <Button
              buttonStyle="bo-text"
              icon={open ? 'chevron-up' : 'chevron-down'}
              iconSize="16px"
              width="28px"
              height="28px"
              padding="0"
              ariaLabel={label}
              ariaExpanded={open}
              onClick={() => setExpanded((expanded) => !expanded)}
            />
          )}
        </Box>
      }
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
