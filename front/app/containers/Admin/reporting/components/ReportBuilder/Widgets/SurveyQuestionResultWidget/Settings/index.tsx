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
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import FieldFilter from './FieldFilter';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../SurveyResultsWidget/messages';
import widgetMessages from '../../messages';
import nativeSurveyMessages from 'containers/Admin/projects/project/nativeSurvey/messages';

// typings
import { Multiloc, IOption } from 'typings';
import { Props } from '../typings';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    title,
    projectId,
    phaseId,
    fieldId,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    fieldId: node.data.props.fieldId,
  }));

  const setTitle = useCallback(
    (value: Multiloc) => {
      setProp((props: Props) => {
        props.title = value;
      });
    },
    [setProp]
  );

  const handleProjectFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.projectId = value;
        props.phaseId = undefined;
        props.fieldId = undefined;
      });
    },
    [setProp]
  );

  const handlePhaseFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.phaseId = value;
        props.fieldId = undefined;
      });
    },
    [setProp]
  );

  const handleFieldFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.fieldId = value;
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

      <Box mb="20px">
        <InputMultilocWithLocaleSwitcher
          id="e2e-analytics-chart-widget-title"
          label={formatMessage(messages.surveySettingsTitle)}
          type="text"
          valueMultiloc={title}
          onChange={setTitle}
        />
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
              fieldId={fieldId}
              onFieldFilter={handleFieldFilter}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default Settings;
