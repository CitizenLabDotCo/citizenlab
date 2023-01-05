import React, { useCallback } from 'react';

// craft
import { useNode } from '@craftjs/core';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';
import { BORDER } from '../constants';

// components
import {
  Box,
  Title,
  Icon,
  Input,
  Text,
} from '@citizenlab/cl2-component-library';
import NoResults from './NoResults';
import SurveyResults from './SurveyResults';
import ProjectFilter from './ProjectFilter';
import PhaseFilter from './PhaseFilter';
import QuestionFilter from './QuestionFilter';
import PageBreakBox from '../PageBreakBox';

// messages
import messages from './messages';
import formBuilderMessages from 'containers/Admin/formBuilder/components/messages';

// types
import { IOption } from 'typings';

// utils
import { useIntl } from 'utils/cl-intl';

type Props = {
  title: string | undefined;
  projectId?: string;
  phaseId?: string;
  shownQuestions?: boolean[];
};

const SurveyResultsWidget = ({
  title,
  projectId,
  phaseId,
  shownQuestions,
}: Props) => {
  return (
    <PageBreakBox border={BORDER} mt="4px" mb="4px">
      <Box>
        <Title variant="h3" color="primary" m="16px" mb="8px">
          {title}
        </Title>
      </Box>
      {projectId ? (
        <SurveyResults
          projectId={projectId}
          phaseId={phaseId}
          shownQuestions={shownQuestions}
        />
      ) : (
        <NoResults />
      )}
    </PageBreakBox>
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
    (value: string) => {
      setProp((props) => {
        props.title = value;
      });
    },
    [setProp]
  );

  const handleProjectFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props) => {
        props.projectId = value;
        props.phaseId = undefined;
        props.shownQuestions = undefined;
      });
    },
    [setProp]
  );

  const handlePhaseFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props) => {
        props.phaseId = value;
      });
    },
    [setProp]
  );

  const handleQuestionToggle = useCallback(
    (questionIndex: number, numberOfQuestions: number) => {
      setProp((props) => {
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
          {formatMessage(formBuilderMessages.informationText)}
        </Text>
      </Box>

      <Box mb="20px">
        <Input
          id="e2e-analytics-chart-widget-title"
          label={formatMessage(messages.surveySettingsTitle)}
          type="text"
          value={title}
          onChange={setTitle}
        />
      </Box>

      <ProjectFilter
        projectId={projectId}
        phaseId={phaseId}
        onPhaseFilter={handlePhaseFilter}
        onProjectFilter={handleProjectFilter}
      />

      {projectId !== undefined && (
        <>
          <PhaseFilter
            projectId={projectId}
            phaseId={phaseId}
            onPhaseFilter={handlePhaseFilter}
          />
          <QuestionFilter
            projectId={projectId}
            phaseId={phaseId}
            shownQuestions={shownQuestions}
            onToggleQuestion={handleQuestionToggle}
          />
        </>
      )}
    </Box>
  );
};

SurveyResultsWidget.craft = {
  props: {
    title: undefined,
    projectId: undefined,
    phaseId: undefined,
  },
  related: {
    settings: SurveyResultsWidgetSettings,
  },
  custom: {
    title: messages.surveyResults,
    noPointerEvents: true,
  },
};

export default SurveyResultsWidget;
