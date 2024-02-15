import React, { useCallback } from 'react';

// craft
import { useNode } from '@craftjs/core';

// components
import {
  Box,
  Text,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import ProjectFilter from '../../_shared/ProjectFilter';
import PhaseFilter from '../../_shared/PhaseFilter';
import QuestionSelect from './QuestionSelect';
import SliceModeSelect from './SliceModeSelect';
import UserFieldSelect from './UserFieldSelect';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../SurveyResultsWidget/messages';
import widgetMessages from '../../messages';
import nativeSurveyMessages from 'containers/Admin/projects/project/nativeSurvey/messages';

// typings
import { IOption } from 'typings';
import { Props } from '../typings';
import { SliceMode } from 'api/graph_data_units/requestTypes';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    projectId,
    phaseId,
    questionId,
    sliceMode,
    sliceFieldId,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    questionId: node.data.props.questionId,
    sliceMode: node.data.props.sliceMode,
    sliceFieldId: node.data.props.sliceFieldId,
  }));

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
      });
    },
    [setProp]
  );

  const handleSliceMode = useCallback(
    (mode?: SliceMode) => {
      setProp((props: Props) => {
        props.sliceMode = mode;
        props.sliceFieldId = undefined;
      });
    },
    [setProp]
  );

  const handleSliceFieldSelect = useCallback(
    (sliceFieldId?: string) => {
      setProp((props: Props) => {
        props.sliceFieldId = sliceFieldId;
      });
    },
    [setProp]
  );

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
          participationMethod="native_survey"
          onPhaseFilter={handlePhaseFilter}
        />
      )}

      {phaseId && (
        <QuestionSelect
          phaseId={phaseId}
          questionId={questionId}
          inputTypes={['select', 'multiselect']}
          onChange={handleQuestion}
        />
      )}

      {questionId && (
        <SliceModeSelect mode={sliceMode} onChange={handleSliceMode} />
      )}

      {sliceMode === 'user_field' && (
        <UserFieldSelect
          userFieldId={sliceFieldId}
          onChange={handleSliceFieldSelect}
        />
      )}

      {phaseId && sliceMode === 'survey_question' && (
        <QuestionSelect
          phaseId={phaseId}
          questionId={sliceFieldId}
          inputTypes={['select']}
          onChange={handleSliceFieldSelect}
        />
      )}
    </Box>
  );
};

export default Settings;
