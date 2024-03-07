import React, { useCallback, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import usePhase from 'api/phases/usePhase';

import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

import PhaseFilter from 'components/UI/PhaseFilter';

import { useIntl } from 'utils/cl-intl';

import ProjectFilter from '../Widgets/_shared/ProjectFilter';
import QuestionSelect from '../Widgets/_shared/QuestionSelect';
import widgetMessages from '../Widgets/messages';

import Analyses from './Analyses';
import messages from './messages';

const Analysis = ({ selectedLocale }: { selectedLocale: string }) => {
  const { projectId: contextProjectId, phaseId: contextPhaseId } =
    useReportContext();

  const [projectId, setProjectId] = useState<string | undefined>(
    contextProjectId
  );
  const [phaseId, setPhaseId] = useState<string | undefined>(contextPhaseId);
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
    : projectId && phaseId;

  return (
    <Box>
      <ProjectFilter
        projectId={projectId}
        emptyOptionMessage={widgetMessages.noProject}
        onProjectFilter={handleProjectFilter}
      />

      {projectId !== undefined && (
        <PhaseFilter
          label={formatMessage(messages.selectPhase)}
          projectId={projectId}
          phaseId={phaseId}
          participationMethods={['native_survey', 'ideation']}
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
          phaseId={phaseId}
          questionId={questionId}
          selectedLocale={selectedLocale}
          participationMethod={phase?.data.attributes.participation_method}
        />
      )}
    </Box>
  );
};

export default Analysis;
