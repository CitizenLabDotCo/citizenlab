import React from 'react';

import { useQueryClient } from '@tanstack/react-query';

import customFieldsKeys from 'api/custom_fields/keys';
import customFormKeys from 'api/custom_form/keys';
import phasesKeys from 'api/phases/keys';

import AssistantPanel from 'components/AiAssistant/AssistantPanel';
import { AiAssistantToolViews } from 'components/AiAssistant/types';

import messages from './messages';

const TOOL_VIEWS: AiAssistantToolViews = {
  get_form_fields: { label: messages.readSurvey },
  replace_form_fields: {
    label: messages.replaceSurvey,
    approveWarning: messages.replaceWarning,
  },
};

type Props = {
  phaseId: string;
  // Called once the approved survey is saved, to reload the builder.
  onFormReplaced: () => void;
};

const SurveyAssistant = ({ phaseId, onFormReplaced }: Props) => {
  const queryClient = useQueryClient();

  const handleToolExecuted = async (toolName: string) => {
    if (toolName !== 'replace_form_fields') return;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: customFieldsKeys.all() }),
      queryClient.invalidateQueries({ queryKey: customFormKeys.all() }),
      queryClient.invalidateQueries({ queryKey: phasesKeys.item({ phaseId }) }),
    ]);
    onFormReplaced();
  };

  return (
    <AssistantPanel
      contextKey="survey_builder"
      contextId={phaseId}
      intro={messages.intro}
      toolViews={TOOL_VIEWS}
      onToolExecuted={handleToolExecuted}
    />
  );
};

export default SurveyAssistant;
