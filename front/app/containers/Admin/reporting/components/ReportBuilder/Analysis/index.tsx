import React, { useCallback, useState } from 'react';

import {
  Box,
  Button,
  Title,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { supportsNativeSurvey } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';
import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

import PhaseFilter from 'components/UI/PhaseFilter';

import { useIntl } from 'utils/cl-intl';

import ProjectFilter from '../Widgets/_shared/ProjectFilter';
import QuestionSelect from '../Widgets/_shared/QuestionSelect';
import widgetMessages from '../Widgets/messages';

import Analyses from './Analyses';
import messages from './messages';

const Analysis = ({ selectedLocale }: { selectedLocale: string }) => {
  const isAnalysisAllowed = useFeatureFlag({
    name: 'analysis',
    onlyCheckAllowed: true,
  });
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

  const supportsSurvey = supportsNativeSurvey(
    phase?.data.attributes.participation_method
  );

  const showAnalyses = supportsSurvey
    ? projectId && phaseId && questionId
    : projectId && phaseId;

  const isIdeationPhase =
    phase?.data.attributes.participation_method === 'ideation';

  return (
    <>
      {!isAnalysisAllowed && (
        <Box p="12px">
          <Title variant="h3">{formatMessage(messages.upsellTitle)}</Title>
          <Text>{formatMessage(messages.upsellDescription)}</Text>
          <Tooltip content={<p>{formatMessage(messages.upsellTooltip)}</p>}>
            <Box>
              <Button disabled icon="lock">
                {formatMessage(messages.upsellButton)}
              </Button>
            </Box>
          </Tooltip>
        </Box>
      )}
      {isAnalysisAllowed && (
        <Box>
          <ProjectFilter
            id="e2e-report-builder-analysis-project-filter-box"
            projectId={projectId}
            emptyOptionMessage={widgetMessages.noProject}
            onProjectFilter={handleProjectFilter}
          />

          {projectId !== undefined && (
            <PhaseFilter
              id="e2e-report-builder-analysis-phase-filter-box"
              label={formatMessage(messages.selectPhase)}
              projectId={projectId}
              phaseId={phaseId}
              participationMethods={[
                'native_survey',
                'ideation',
                'community_monitor_survey',
              ]}
              onPhaseFilter={handlePhaseFilter}
            />
          )}

          {phaseId && (
            <QuestionSelect
              phaseId={phaseId}
              questionId={questionId}
              filterQuestion={({ attributes }) => {
                return [
                  'text',
                  'multiline_text',
                  'sentiment_linear_scale',
                ].includes(attributes.input_type);
              }}
              label={formatMessage(messages.question)}
              onChange={handleQuestion}
            />
          )}
          {showAnalyses && (
            <Analyses
              projectId={projectId}
              phaseId={supportsSurvey || isIdeationPhase ? phaseId : undefined}
              questionId={questionId}
              selectedLocale={selectedLocale}
              participationMethod={phase?.data.attributes.participation_method}
            />
          )}
        </Box>
      )}
    </>
  );
};

export default Analysis;
