import React, { useCallback, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import usePhase from 'api/phases/usePhase';

import PhaseFilter from 'components/UI/PhaseFilter';

import { useIntl } from 'utils/cl-intl';

import ProjectFilter from '../Widgets/_shared/ProjectFilter';
import QuestionSelect from '../Widgets/_shared/QuestionSelect';
import widgetMessages from '../Widgets/messages';

import Analyses from './Analyses';
import messages from './messages';

const Analysis = ({ selectedLocale }: { selectedLocale: string }) => {
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [phaseId, setPhaseId] = useState<string | undefined>(undefined);
  const [questionId, setQuestionId] = useState<string | undefined>(undefined);

  const { data: phase } = usePhase(phaseId);

  const { formatMessage } = useIntl();

  const handleProjectFilter = useCallback(({ value }: IOption) => {
    setProjectId(value);
    setPhaseId(undefined);
    setQuestionId(undefined);
  }, []);

  const handlePhaseFilter = useCallback(({ value }: IOption) => {
    setPhaseId(value);
    setQuestionId(undefined);
  }, []);

  const handleQuestion = useCallback((questionId: string) => {
    setQuestionId(questionId);
  }, []);

  const isNativeSurveyPhase =
    phase?.data.attributes.participation_method === 'native_survey';

  const showAnalyses = isNativeSurveyPhase
    ? projectId && phaseId && questionId
    : projectId;

  return (
    <Box>
      <ProjectFilter
        projectId={projectId}
        emptyOptionMessage={widgetMessages.noProject}
        onProjectFilter={handleProjectFilter}
      />

      {projectId !== undefined && (
        <PhaseFilter
          hideIfNoAppropriatePhases
          label={formatMessage(messages.surveyPhase)}
          projectId={projectId}
          phaseId={phaseId}
          participationMethods={['native_survey']}
          onPhaseFilter={handlePhaseFilter}
        />
      )}

      {phaseId && (
        <QuestionSelect
          phaseId={phaseId}
          questionId={questionId}
          inputTypes={['text', 'multiline_text']}
          label={formatMessage(messages.question)}
          onChange={handleQuestion}
        />
      )}
      {showAnalyses && (
        <Analyses
          projectId={projectId}
          phaseId={isNativeSurveyPhase ? phaseId : undefined}
          questionId={questionId}
          selectedLocale={selectedLocale}
        />
      )}
    </Box>
  );
};

export default Analysis;
