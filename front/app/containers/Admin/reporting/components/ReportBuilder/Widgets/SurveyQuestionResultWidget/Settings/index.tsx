import React, { useCallback } from 'react';

import {
  Box,
  Text,
  Icon,
  Toggle,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import { ICustomFields } from 'api/custom_fields/types';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import { GroupMode } from 'api/graph_data_units/requestTypes';

import nativeSurveyMessages from 'containers/Admin/projects/project/nativeSurvey/messages';

import HeatmapTooltipContent from 'components/admin/FormResults/FormResultsQuestion/MappingQuestions/PointLocationQuestion/HeatmapTooltipContent';
import PhaseFilter from 'components/UI/PhaseFilter';

import { useIntl } from 'utils/cl-intl';

import {
  SURVEY_QUESTION_INPUT_TYPES,
  SLICE_SURVEY_QUESTION_INPUT_TYPES,
} from '../../../constants';
import ProjectFilter from '../../_shared/ProjectFilter';
import QuestionSelect from '../../_shared/QuestionSelect';
import widgetMessages from '../../messages';
import { Props } from '../typings';

import GroupModeSelect from './GroupModeSelect';
import messages from './messages';
import UserFieldSelect from './UserFieldSelect';
import { FieldsHideGroupBy } from './utils';

const findQuestion = (questions: ICustomFields, questionId: string) => {
  return questions.data.find((question) => question.id === questionId);
};

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    projectId,
    phaseId,
    questionId,
    groupMode,
    groupFieldId,
    heatmap,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    questionId: node.data.props.questionId,
    groupMode: node.data.props.groupMode,
    groupFieldId: node.data.props.groupFieldId,
    heatmap: node.data.props.heatmap,
  }));

  const { data: questions } = useRawCustomFields({ phaseId });

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

  return (
    <Box>
      <Box
        bgColor={colors.teal100}
        borderRadius={stylingConsts.borderRadius}
        px="12px"
        py="4px"
        mt="0px"
        mb="16px"
        role="alert"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text variant="bodyS" color="textSecondary">
          <Icon
            name="info-outline"
            width="16px"
            height="16px"
            mr="4px"
            fill="textSecondary"
            display="inline"
          />
          {formatMessage(nativeSurveyMessages.informationText)}
        </Text>
      </Box>

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

      {showHeatmapSettings && (
        <Box my="32px">
          <Toggle
            label={<HeatmapTooltipContent />}
            checked={!!heatmap}
            onChange={handleHeatmap}
          />
        </Box>
      )}
    </Box>
  );
};

export default Settings;
