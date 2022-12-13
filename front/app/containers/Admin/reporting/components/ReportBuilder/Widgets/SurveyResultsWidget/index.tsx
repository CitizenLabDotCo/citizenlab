import React from 'react';

// craft
import { useNode, UserComponent } from '@craftjs/core';
import { Box, Input, Title } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';

// hooks
import { injectIntl } from '../../../../../../../utils/cl-intl';
import { IOption } from '../../../../../../../typings';
import ProjectFilter from '../../../../../dashboard/components/filters/ProjectFilter';

const SurveyResultsWidget: UserComponent = ({ title, projectId }) => {
  return (
    <Box id="e2e-survey-result-widget">
      SURVEY RESULTS - {projectId} {title}
    </Box>
  );
};

const SurveyResultsWidgetSettings = injectIntl(
  ({ intl: { formatMessage } }) => {
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
        <Box background="#ffffff" marginBottom="20px">
          <Input
            id="e2e-analytics-chart-widget-title"
            label={
              <Title variant="h4" color="tenantText" mb={'0'}>
                {formatMessage(messages.surveyResults)}
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
  }
);

SurveyResultsWidget.craft = {
  props: {
    title: '',
    project: '',
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
