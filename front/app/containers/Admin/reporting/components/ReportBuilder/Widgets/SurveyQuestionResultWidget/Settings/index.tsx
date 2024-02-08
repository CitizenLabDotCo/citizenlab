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
import FieldFilter from './FieldFilter';
import UserFieldFilter from './UserFieldFilter';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../SurveyResultsWidget/messages';
import widgetMessages from '../../messages';
import nativeSurveyMessages from 'containers/Admin/projects/project/nativeSurvey/messages';

// typings
import { IOption } from 'typings';
import { Props } from '../typings';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    projectId,
    phaseId,
    questionId,
    groupByUserFieldId,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    questionId: node.data.props.questionId,
    groupByUserFieldId: node.data.props.groupByUserFieldId,
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

  const handleFieldFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.questionId = value;
      });
    },
    [setProp]
  );

  const handleGroupByUserFieldFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        if (value === '') {
          props.groupByUserFieldId = undefined;
        } else {
          props.groupByUserFieldId = value;
        }
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
          {formatMessage(nativeSurveyMessages.informationText2)}
        </Text>
      </Box>

      <ProjectFilter
        projectId={projectId}
        emptyOptionMessage={widgetMessages.noProject}
        onProjectFilter={handleProjectFilter}
      />

      {projectId !== undefined && (
        <>
          <PhaseFilter
            label={formatMessage(messages.surveyPhase)}
            projectId={projectId}
            phaseId={phaseId}
            participationMethod="native_survey"
            onPhaseFilter={handlePhaseFilter}
          />
          {phaseId && (
            <FieldFilter
              phaseId={phaseId}
              fieldId={questionId}
              onFieldFilter={handleFieldFilter}
            />
          )}
        </>
      )}

      <UserFieldFilter
        userFieldId={groupByUserFieldId}
        onFilter={handleGroupByUserFieldFilter}
      />
    </Box>
  );
};

export default Settings;
