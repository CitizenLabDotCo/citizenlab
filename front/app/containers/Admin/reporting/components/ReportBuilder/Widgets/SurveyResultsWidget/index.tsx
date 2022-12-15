import React from 'react';

// craft
import { useNode, UserComponent } from '@craftjs/core';

// components
import {
  Box,
  colors,
  Icon,
  Input,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import GraphCard from '../../../../../../../components/admin/GraphCard';
import SurveyResultsReport from './SurveyResultsReport';

// i18n
import messages from './messages';
import formBuilderMessages from 'containers/Admin/formBuilder/components/messages';

// types
import { IOption } from '../../../../../../../typings';

// settings

// utils
import { useIntl } from 'utils/cl-intl';
import SurveyQuestionFilter from './SurveyQuestionFilter';
import SurveyReportFilter from './SurveyReportFilter';

type SurveyResultsProps = {
  title: string | undefined;
  projectId: string;
  phaseId: string | undefined;
  showQuestions: number[] | undefined;
};

const SurveyResultsWidget: UserComponent = ({
  title,
  projectId,
  phaseId,
  showQuestions,
}: SurveyResultsProps) => {
  return (
    <GraphCard title={title}>
      <SurveyResultsReport
        projectId={projectId}
        phaseId={phaseId}
        showQuestions={showQuestions}
      />
    </GraphCard>
  );
};

const SurveyResultsWidgetSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    title,
    projectId,
    phaseId,
    showQuestions,
  } = useNode((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    showQuestions: node.data.props.showQuestions,
  }));

  const setTitle = (value: string) => {
    setProp((props) => {
      props.title = value;
    });
  };

  const handleProjectFilter = ({ value }: IOption) => {
    setProp((props) => {
      props.projectId = value;
      props.phaseId = null;
    });
  };

  const handlePhaseFilter = ({ value }: IOption) => {
    setProp((props) => {
      props.phaseId = value;
    });
  };

  const handleQuestionToggle = (newQuestions: number[]) => {
    console.log(newQuestions);
    setProp((props) => {
      props.showQuestions = newQuestions;
    });
  };

  return (
    <Box>
      <Box
        bgColor={colors.teal100}
        borderRadius="3px"
        px="12px"
        py="4px"
        mt="0px"
        mb="10px"
        role="alert"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Icon
          name="info-outline"
          width="24px"
          height="24px"
          fill="textSecondary"
        />
        <Text variant="bodyM" color="textSecondary">
          {formatMessage(formBuilderMessages.informationText)}
        </Text>
      </Box>

      <Box mb="20px">
        <Input
          id="e2e-analytics-chart-widget-title"
          label={
            <Title variant="h4" color="tenantText" mb={'0'}>
              {formatMessage(messages.surveySettingsTitle)}
            </Title>
          }
          type="text"
          value={title}
          onChange={setTitle}
        />
      </Box>

      <SurveyReportFilter
        projectId={projectId}
        currentPhaseFilter={phaseId}
        onPhaseFilter={handlePhaseFilter}
        onProjectFilter={handleProjectFilter}
      />

      <SurveyQuestionFilter
        projectId={projectId}
        phaseId={phaseId}
        showQuestions={showQuestions}
        onToggleQuestion={handleQuestionToggle}
      />
    </Box>
  );

  // Should not need to show an error if a) no surveys in site or b) no surveys in project
  // as a) will be limited to use the widget and b) won't show projects without surveys
  // TODO: Is there an all surveys endpoint or can it be derived?
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
