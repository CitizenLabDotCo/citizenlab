import React from 'react';

import AssistantPanel from 'components/AiAssistant/AssistantPanel';

import messages from './messages';

type Props = {
  phaseId: string;
};

const SurveyAssistant = ({ phaseId }: Props) => (
  <AssistantPanel
    contextKey="survey_builder"
    contextId={phaseId}
    intro={messages.intro}
  />
);

export default SurveyAssistant;
