import React from 'react';

// craft
import { Element, useNode, UserComponent } from '@craftjs/core';

// components
import {
  Box,
  Icon,
  Input,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import GraphCard from '../../../../../../../components/admin/GraphCard';
import Container from '../../../../../../../components/admin/ContentBuilder/Widgets/Container';
import SurveyResultsQuestionWidget from './SurveyResultsQuestionWidget';

// i18n
import messages from './messages';
import formBuilderMessages from 'containers/Admin/formBuilder/components/messages';

// types
import { IOption } from '../../../../../../../typings';

// settings
import ProjectFilter from '../../../../../dashboard/components/filters/ProjectFilter';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { useIntl } from 'utils/cl-intl';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import useFormResults from 'hooks/useFormResults';

type SurveyResultsProps = {
  title: string | undefined;
  projectId: string | undefined;
  phaseId: string | undefined;
};

const SurveyResultsWidget: UserComponent = ({
  title,
  projectId,
  phaseId,
}: SurveyResultsProps) => {
  const { formatMessage } = useIntl();

  // TODO: If no project or phase then get the first project with a survey
  const useProjectId =
    projectId === undefined
      ? 'd6827fd0-29bf-4e1d-8861-420386a61c34'
      : projectId;
  const usePhaseId =
    phaseId === undefined ? '350adbb0-6ca5-48aa-aedd-e7d7d2e5fc6b' : phaseId;

  const locale = useLocale();
  const project = useProject({ projectId: useProjectId });
  const formResults = useFormResults({
    projectId: useProjectId,
    phaseId: usePhaseId,
  });

  if (
    isNilOrError(formResults) ||
    isNilOrError(locale) ||
    isNilOrError(project)
  ) {
    return null;
  }

  const { totalSubmissions, results } = formResults;

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(formBuilderMessages.totalSurveyResponses, {
          count: totalSubmissions,
        })
      : formatMessage(formBuilderMessages.noSurveyResponses);

  const resultsTitle = title ? title : formatMessage(messages.surveyResults);

  return (
    <GraphCard title={resultsTitle}>
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Text variant="bodyM" color="textSecondary">
          {surveyResponseMessage}
        </Text>
      </Box>
      <Box width="100%" display="flex" flexDirection="row">
        {results.map(
          (
            { question, inputType, answers, totalResponses, required },
            index
          ) => {
            return (
              <Element
                id={`question-title-${index}`}
                key={index}
                is={Container}
                canvas
              >
                <SurveyResultsQuestionWidget
                  key={index}
                  locale={locale}
                  question={question}
                  inputType={inputType}
                  answers={answers}
                  totalResponses={totalResponses}
                  required={required}
                />
              </Element>
            );
          }
        )}
      </Box>
    </GraphCard>
  );
};

const SurveyResultsWidgetSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    title,
    projectId,
  } = useNode((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
  }));

  const setTitle = (value: string) => {
    setProp((props) => {
      props.title = value;
    });
  };

  const handleProjectFilter = ({ value }: IOption) => {
    setProp((props) => {
      props.projectId = value;
    });
  };

  return (
    <Box>
      <Box display="flex" gap="16px" alignItems="center">
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
      <Box background="#ffffff" marginBottom="20px">
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
      <Box mb="20px">
        <ProjectFilter
          currentProjectFilter={projectId}
          width="100%"
          padding="11px"
          onProjectFilter={handleProjectFilter}
        />
      </Box>
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
