import React, { useCallback } from 'react';

import { Box, Toggle, Select } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import useAnalyses from 'api/analyses/useAnalyses';
import { ICustomFields } from 'api/custom_fields/types';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import { GroupMode } from 'api/graph_data_units/requestTypes';

import useLocale from 'hooks/useLocale';

import HeatmapTooltipContent from 'components/admin/FormResults/FormResultsQuestion/MappingQuestions/PointLocationQuestion/HeatmapTooltipContent';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import PhaseFilter from 'components/UI/PhaseFilter';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import Insights from '../../../Analysis/Insights';
import {
  SURVEY_QUESTION_INPUT_TYPES,
  SLICE_SURVEY_QUESTION_INPUT_TYPES,
} from '../../../constants';
import ProjectFilter from '../../_shared/ProjectFilter';
import QuestionSelect from '../../_shared/QuestionSelect';
import { AccessibilityInputs } from '../../ChartWidgets/_shared/AccessibilityInputs';
import widgetMessages from '../../messages';
import { Props } from '../typings';

import GroupModeSelect from './GroupModeSelect';
import messages from './messages';
import UserFieldSelect from './UserFieldSelect';
import { FieldsHideGroupBy, FieldsWithSortOption } from './utils';

const findQuestion = (questions: ICustomFields, questionId: string) => {
  return questions.data.find((question) => question.id === questionId);
};

const Settings = () => {
  const { formatMessage } = useIntl();
  const locale = useLocale();

  const {
    actions: { setProp },
    projectId,
    phaseId,
    questionId,
    groupMode,
    groupFieldId,
    heatmap,
    sort,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    questionId: node.data.props.questionId,
    groupMode: node.data.props.groupMode,
    groupFieldId: node.data.props.groupFieldId,
    heatmap: node.data.props.heatmap,
    sort: node.data.props.sort,
  }));

  const { data: questions } = useRawCustomFields({ phaseId });
  const { data: analyses } = useAnalyses({
    phaseId,
  });

  const selectedQuestion =
    questions && questionId ? findQuestion(questions, questionId) : undefined;

  const showGroupingSettings =
    questionId &&
    selectedQuestion &&
    !FieldsHideGroupBy.includes(selectedQuestion.attributes.input_type);

  const showHeatmapSettings =
    questionId &&
    selectedQuestion &&
    selectedQuestion.attributes.input_type === 'point';
  const questionTypesWithCharts = [
    'linear_scale',
    'multiselect',
    'select',
    'multiselect_image',
    'select_image',
    'sentiment_linear_scale',
    'rating',
    'ranking',
  ];
  const showAccessibilityInputs =
    selectedQuestion &&
    questionTypesWithCharts.includes(selectedQuestion.attributes.input_type);

  const showSortSettings =
    questionId &&
    selectedQuestion &&
    FieldsWithSortOption.includes(selectedQuestion.attributes.input_type);

  const sortOptions = [
    { value: 'count', label: formatMessage(messages.sortByCount) },
    { value: 'original', label: formatMessage(messages.sortByOriginal) },
  ];

  const handleProjectFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.projectId = value;
        props.phaseId = undefined;
        props.questionId = undefined;
      });
    },
    [setProp]
  );

  const handlePhaseFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.phaseId = value;
        props.questionId = undefined;
      });
    },
    [setProp]
  );

  const handleQuestion = useCallback(
    (questionId: string) => {
      setProp((props: Props) => {
        props.questionId = questionId;
        props.groupMode = undefined;
        props.groupFieldId = undefined;
        props.heatmap = undefined;
      });
    },
    [setProp]
  );

  const handleGroupMode = useCallback(
    (mode?: GroupMode) => {
      setProp((props: Props) => {
        props.groupMode = mode;
        props.groupFieldId = undefined;
      });
    },
    [setProp]
  );

  const handleGroupField = useCallback(
    (groupFieldId?: string) => {
      setProp((props: Props) => {
        props.groupFieldId = groupFieldId;
      });
    },
    [setProp]
  );

  const handleHeatmap = useCallback(() => {
    setProp((props: Props) => {
      props.heatmap = !heatmap;
    });
  }, [setProp, heatmap]);

  const handleSort = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.sort = value;
      });
    },
    [setProp]
  );

  const relevantAnalyses = analyses?.data.filter(
    (analysis) =>
      analysis.relationships.main_custom_field?.data?.id === questionId
  );

  const showInsights = projectId && phaseId && questionId;
  return (
    <Box>
      <ProjectFilter
        projectId={projectId}
        emptyOptionMessage={widgetMessages.noProject}
        onProjectFilter={handleProjectFilter}
      />

      {projectId !== undefined && (
        <PhaseFilter
          label={formatMessage(messages.surveyPhase)}
          projectId={projectId}
          phaseId={phaseId}
          participationMethods={['native_survey', 'community_monitor_survey']}
          onPhaseFilter={handlePhaseFilter}
        />
      )}

      {phaseId && (
        <QuestionSelect
          phaseId={phaseId}
          questionId={questionId}
          filterQuestion={({ attributes }) => {
            return SURVEY_QUESTION_INPUT_TYPES.has(attributes.input_type);
          }}
          label={formatMessage(messages.question)}
          onChange={handleQuestion}
        />
      )}

      {showGroupingSettings && (
        <>
          <GroupModeSelect mode={groupMode} onChange={handleGroupMode} />

          {groupMode === 'user_field' && (
            <UserFieldSelect
              userFieldId={groupFieldId}
              onChange={handleGroupField}
            />
          )}

          {phaseId && groupMode === 'survey_question' && (
            <QuestionSelect
              phaseId={phaseId}
              questionId={groupFieldId}
              filterQuestion={({ attributes: { input_type }, id }) => {
                const supportedInputType =
                  SLICE_SURVEY_QUESTION_INPUT_TYPES.has(input_type);
                return supportedInputType && id !== questionId;
              }}
              label={formatMessage(messages.groupBySurveyQuestion)}
              onChange={handleGroupField}
            />
          )}
        </>
      )}

      {showInsights &&
        relevantAnalyses?.map((analysis) => (
          <Box
            key={analysis.id}
            display="flex"
            flexDirection="column"
            gap="8px"
            mb="16px"
          >
            <ButtonWithLink
              linkTo={`/admin/projects/${projectId}/analysis/${analysis.id}?phase_id=${phaseId}`}
            >
              {formatMessage(messages.openAIAnalysis)}
            </ButtonWithLink>
            <Warning>{formatMessage(messages.dragAndDrop)}</Warning>
            <Insights
              analysisId={analysis.id}
              key={analysis.id}
              projectId={projectId}
              selectedLocale={locale}
              phaseId={phaseId}
            />
          </Box>
        ))}

      {showSortSettings && (
        <Box mb="20px">
          <Select
            label={formatMessage(messages.sort)}
            options={sortOptions}
            value={sort || 'count'}
            onChange={handleSort}
            dataCy="sort-select"
          />
        </Box>
      )}

      {showHeatmapSettings && (
        <Box my="32px">
          <Toggle
            label={<HeatmapTooltipContent />}
            checked={!!heatmap}
            onChange={handleHeatmap}
          />
        </Box>
      )}
      {showAccessibilityInputs && <AccessibilityInputs />}
    </Box>
  );
};

export default Settings;
