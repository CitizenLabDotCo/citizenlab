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
import PhaseFilter from 'components/UI/PhaseFilter';
import QuestionSelect from './QuestionSelect';
import GroupModeSelect from './GroupModeSelect';
import UserFieldSelect from './UserFieldSelect';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import widgetMessages from '../../messages';
import nativeSurveyMessages from 'containers/Admin/projects/project/nativeSurvey/messages';

// typings
import { IOption } from 'typings';
import { Props } from '../typings';
import { GroupMode } from 'api/graph_data_units/requestTypes';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    projectId,
    phaseId,
    questionId,
    groupMode,
    groupFieldId,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    questionId: node.data.props.questionId,
    groupMode: node.data.props.groupMode,
    groupFieldId: node.data.props.groupFieldId,
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
          participationMethods={['native_survey']}
          onPhaseFilter={handlePhaseFilter}
        />
      )}

      {phaseId && (
        <QuestionSelect
          phaseId={phaseId}
          questionId={questionId}
          inputTypes={['select', 'multiselect']}
          label={formatMessage(messages.question)}
          onChange={handleQuestion}
        />
      )}

      {questionId && (
        <GroupModeSelect mode={groupMode} onChange={handleGroupMode} />
      )}

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
          inputTypes={['select']}
          label={formatMessage(messages.groupBySurveyQuestion)}
          onChange={handleGroupField}
        />
      )}
    </Box>
  );
};

export default Settings;
