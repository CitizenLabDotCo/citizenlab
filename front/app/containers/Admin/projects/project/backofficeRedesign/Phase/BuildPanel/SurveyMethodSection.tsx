import React from 'react';

import { Box, Divider } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SurveyMethodChoices, {
  SurveyMethod,
} from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';

export interface SurveyMethodSwitch {
  disabledReasons?: Partial<Record<SurveyMethod, string>>;
  onSelect: (method: SurveyMethod) => void;
}

interface Props extends SurveyMethodSwitch {
  selected: ParticipationMethod;
}

const SurveyMethodSection = ({
  selected,
  disabledReasons,
  onSelect,
}: Props) => {
  const surveysEnabled = useFeatureFlag({ name: 'surveys' });

  return (
    <>
      <Divider />
      <Box display="flex" flexDirection="column" gap="12px" mb="16px">
        <SurveyMethodChoices
          selected={selected}
          showExternalSurvey={surveysEnabled || selected === 'survey'}
          disabledReasons={disabledReasons}
          onSelect={(_event, method) => onSelect(method)}
          cardWidth="100%"
        />
      </Box>
    </>
  );
};

export default SurveyMethodSection;
