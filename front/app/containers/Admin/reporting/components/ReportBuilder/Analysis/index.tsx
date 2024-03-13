import React, { useCallback, useState } from 'react';

import { Box, Button, Title, Text } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import { IOption } from 'typings';

import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

import PhaseFilter from 'components/UI/PhaseFilter';

import { useIntl } from 'utils/cl-intl';

import ProjectFilter from '../Widgets/_shared/ProjectFilter';
import QuestionSelect from '../Widgets/_shared/QuestionSelect';
import widgetMessages from '../Widgets/messages';

import Analyses from './Analyses';
import messages from './messages';

const Analysis = ({ selectedLocale }: { selectedLocale: string }) => {
  const isAnalysisEnabled = useFeatureFlag({
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

  const isNativeSurveyPhase =
    phase?.data.attributes.participation_method === 'native_survey';

  const showAnalyses = isNativeSurveyPhase
    ? projectId && phaseId && questionId
    : projectId && phaseId;

  return (
    <>
      {!isAnalysisEnabled && (
        <Box p="12px">
          <Title variant="h3">{formatMessage(messages.upsellTitle)}</Title>
          <Text>{formatMessage(messages.upsellDescription)}</Text>
          <Tippy content={<p>{formatMessage(messages.upsellTooltip)}</p>}>
            <Box>
              <Button disabled icon="lock">
                {formatMessage(messages.upsellButton)}
              </Button>
            </Box>
          </Tippy>
        </Box>
      )}
      {isAnalysisEnabled && (
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
              filterQuestion={({ attributes }) => {
                return ['text', 'multiline_text'].includes(
                  attributes.input_type
                );
              }}
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
      )}
    </>
  );
};

export default Analysis;
