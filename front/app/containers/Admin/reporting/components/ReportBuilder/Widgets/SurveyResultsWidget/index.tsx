import React, { useCallback } from 'react';

// craft
import { useNode } from '@craftjs/core';

// styling
import {
  colors,
  stylingConsts,
  Box,
  Icon,
  Text,
} from '@citizenlab/cl2-component-library';

// components
import Card from '../_shared/Card';
import SurveyResults from './SurveyResults';
import NoData from '../_shared/NoData';
import ProjectFilter from '../_shared/ProjectFilter';
import PhaseFilter from '../_shared/PhaseFilter';
import QuestionFilter from './QuestionFilter';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import widgetMessages from '../messages';
import nativeSurveyMessages from 'containers/Admin/projects/project/nativeSurvey/messages';

// types
import { IOption, Multiloc } from 'typings';

export type Props = {
  title?: Multiloc;
  projectId?: string;
  phaseId?: string;
  shownQuestions?: boolean[];
};

const SurveyResultsWidget = ({ title, phaseId, shownQuestions }: Props) => {
  return (
    <Card title={title} data-testid="survey-results-widget">
      {phaseId ? (
        <SurveyResults phaseId={phaseId} shownQuestions={shownQuestions} />
      ) : (
        <NoData message={messages.surveyNoResults} />
      )}
    </Card>
  );
};

const SurveyResultsWidgetSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    title,
    projectId,
    phaseId,
    shownQuestions,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    shownQuestions: node.data.props.shownQuestions,
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
        props.shownQuestions = undefined;
      });
    },
    [setProp]
  );

  const handlePhaseFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.phaseId = value;
      });
    },
    [setProp]
  );

  const handleQuestionToggle = useCallback(
    (questionIndex: number, numberOfQuestions: number) => {
      setProp((props: Props) => {
        const newShownQuestions = props.shownQuestions
          ? [...props.shownQuestions]
          : Array(numberOfQuestions).fill(true);

        newShownQuestions[questionIndex] = !newShownQuestions[questionIndex];

        props.shownQuestions = newShownQuestions;
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
            label={formatMessage(messages.surveyPhases)}
            projectId={projectId}
            phaseId={phaseId}
            participationMethod="native_survey"
            onPhaseFilter={handlePhaseFilter}
          />
          {phaseId && (
            <QuestionFilter
              phaseId={phaseId}
              shownQuestions={shownQuestions}
              onToggleQuestion={handleQuestionToggle}
            />
          )}
        </>
      )}
    </Box>
  );
};

SurveyResultsWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    phaseId: undefined,
  },
  related: {
    settings: SurveyResultsWidgetSettings,
  },
};

export const surveyResultsTitle = messages.surveyResults;

export default SurveyResultsWidget;
