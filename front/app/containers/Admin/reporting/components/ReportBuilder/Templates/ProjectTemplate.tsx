import React from 'react';
import moment from 'moment';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';

// craft
import { Element } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';

// shared widgets
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

// report builder widgets
import TitleMultiloc from '../Widgets/TitleMultiloc';
import AboutReportWidget from '../Widgets/AboutReportWidget';
import TwoColumn from '../Widgets/TwoColumn';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import GenderWidget from '../Widgets/ChartWidgets/GenderWidget';
import AgeWidget from '../Widgets/ChartWidgets/AgeWidget';
import VisitorsWidget from '../Widgets/ChartWidgets/VisitorsWidget';
import ActiveUsersWidget from '../Widgets/ChartWidgets/ActiveUsersWidget';
import SurveyResultsWidget from '../Widgets/SurveyResultsWidget';
import MostReactedIdeasWidget from '../Widgets/MostReactedIdeasWidget';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import getProjectPeriod from 'containers/Admin/reporting/utils/getProjectPeriod';
import { getTemplateData } from './getTemplateData';

interface Props {
  reportId: string;
  projectId: string;
}

const ProjectTemplate = ({ reportId, projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!project || !phases) return null;

  const { participationMethod, phaseId } = getTemplateData(
    project.data,
    phases.data
  );

  const hasPhases =
    project.data.attributes.process_type === 'timeline' &&
    phases.data.length > 0;

  const projectPeriod = hasPhases
    ? getProjectPeriod(phases.data)
    : { startAt: undefined, endAt: moment().format('YYYY-MM-DD') };

  return (
    <Element id="project-report-template" is={Box} canvas>
      <AboutReportWidget
        reportId={reportId}
        projectId={projectId}
        {...projectPeriod}
      />
      {/* <TitleMultiloc text={formatMessage(messages.reportSummary)} /> */}
      {/* <TextMultiloc text={formatMessage(messages.reportSummaryDescription)} /> */}
      <WhiteSpace />
      {/* <TitleMultiloc text={formatMessage(messages.projectResults)} /> */}
      {/* <TextMultiloc text={formatMessage(messages.descriptionPlaceHolder)} /> */}
      <ActiveUsersWidget projectId={projectId} {...projectPeriod} />
      {participationMethod === 'native_survey' && (
        <SurveyResultsWidget projectId={projectId} phaseId={phaseId} />
      )}
      {participationMethod === 'ideation' && (
        <MostReactedIdeasWidget
          projectId={projectId}
          phaseId={phaseId}
          numberOfIdeas={5}
          collapseLongText={false}
        />
      )}
      <WhiteSpace />
      <Title text={formatMessage(messages.participants)} />
      <TextMultiloc text={formatMessage(messages.descriptionPlaceHolder)} />
      <TwoColumn columnLayout="1-1">
        <Element id="left" is={Container} canvas>
          <GenderWidget
            projectId={projectId}
            title={formatMessage(GenderWidget.craft.custom.title)}
            {...projectPeriod}
          />
        </Element>
        <Element id="right" is={Container} canvas>
          <AgeWidget
            projectId={projectId}
            title={formatMessage(AgeWidget.craft.custom.title)}
            {...projectPeriod}
          />
        </Element>
      </TwoColumn>
      <Title text={formatMessage(messages.visitors)} />
      <TextMultiloc text={formatMessage(messages.descriptionPlaceHolder)} />
      <VisitorsWidget
        projectId={projectId}
        title={formatMessage(VisitorsWidget.craft.custom.title)}
        {...projectPeriod}
      />
    </Element>
  );
};

export default ProjectTemplate;
