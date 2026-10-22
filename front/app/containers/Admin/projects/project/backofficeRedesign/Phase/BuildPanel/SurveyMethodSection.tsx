import React from 'react';

import { ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import pickerMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/messages';
import SurveyMethodChoices, {
  SurveyMethod,
} from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';

import { useIntl } from 'utils/cl-intl';

export interface SurveyMethodSwitch {
  disabledReasons?: Partial<Record<SurveyMethod, string>>;
  onSelect: (method: SurveyMethod) => void;
}

import PanelField from './PanelField';

interface Props extends SurveyMethodSwitch {
  selected: ParticipationMethod;
}

const SurveyMethodSection = ({
  selected,
  disabledReasons,
  onSelect,
}: Props) => {
  const { formatMessage } = useIntl();
  const surveysEnabled = useFeatureFlag({ name: 'surveys' });

  return (
    <PanelField label={formatMessage(pickerMessages.surveyOptions)}>
      <SurveyMethodChoices
        selected={selected}
        showExternalSurvey={surveysEnabled || selected === 'survey'}
        disabledReasons={disabledReasons}
        onSelect={(_event, method) => onSelect(method)}
        cardWidth="100%"
      />
    </PanelField>
  );
};

export default SurveyMethodSection;
