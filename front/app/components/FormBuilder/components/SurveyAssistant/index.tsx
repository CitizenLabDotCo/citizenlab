import React from 'react';

import AssistantPanel from 'components/AiAssistant/AssistantPanel';
import { AiAssistantToolViews } from 'components/AiAssistant/types';

import messages from './messages';

const TOOL_VIEWS: AiAssistantToolViews = {
  get_form_fields: { label: messages.readSurvey },
};

type Props = {
  phaseId: string;
};

const SurveyAssistant = ({ phaseId }: Props) => (
  <AssistantPanel
    contextKey="survey_builder"
    contextId={phaseId}
    intro={messages.intro}
    toolViews={TOOL_VIEWS}
  />
);

export default SurveyAssistant;
