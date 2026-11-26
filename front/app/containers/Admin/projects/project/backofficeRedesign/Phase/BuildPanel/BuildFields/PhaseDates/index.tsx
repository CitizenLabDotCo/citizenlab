import React, { useState } from 'react';

import { CLErrors } from 'typings';

import { RequiredMarker } from 'design-system/Field';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import { CardButton } from 'containers/Admin/projects/_shared/components/SetupCardButton';
import PhaseDatePicker, {
  PhaseDates as Dates,
} from 'containers/Admin/projects/project/phaseSetup/components/PhaseDatePicker';
import usePhaseDateRanges from 'containers/Admin/projects/project/phaseSetup/components/PhaseDatePicker/usePhaseDateRanges';
import { isSurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import { useIntl } from 'utils/cl-intl';
import { getDateInTimezone } from 'utils/dateUtils';

import PanelField from '../../PanelField';

import DatesSummary from './DatesSummary';
import DateStatus from './DateStatus';
import messages from './messages';

interface Props {
  participationMethod: ParticipationMethod;
  formData: IUpdatedPhaseProperties;
  errors: CLErrors | null;
  validationErrors: ValidationErrors;
  standalone: boolean;
  onChange: (dates: Dates) => void;
}

const PhaseDates = ({
  participationMethod,
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

  const now = getDateInTimezone(new Date().toISOString(), ranges.timeZone);

  const label = formatMessage(
    isSurveyMethod(participationMethod)
      ? messages.surveyDates
      : phaseSetupMessages.datesLabel
  );
  const hasError =
    !!errors?.start_at || !!errors?.end_at || !!validationErrors.phaseDateError;
  // Keep the disclosure mounted while a first date is picked or a save fails.
  const open = expanded || hasError;

  const handleChange = (dates: Dates) => {
    setExpanded(true);
    onChange(dates);
  };

  const toggle: CardButton = {
    icon: open ? 'chevron-up' : 'chevron-down',
    expanded: open,
    onClick: () => setExpanded(!open),
  };

  return (
    <PanelField
      label={label}
      action={
        formData.start_at ? (
          !open && (
            <DatesSummary startAt={formData.start_at} endAt={formData.end_at} />
          )
        ) : (
          <RequiredMarker />
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
          variant="panel"
          label={label}
        />
      )}
      {open && ranges.selectedRange.from && now && (
        <DateStatus
          from={ranges.selectedRange.from}
          to={ranges.selectedRange.to}
          now={now}
        />
      )}
    </PanelField>
  );
};

export default PhaseDates;
