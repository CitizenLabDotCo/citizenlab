import React from 'react';
import moment from 'moment';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'hooks/usePhases';

// craft
import { Element } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';
import AboutReportWidget from '../Widgets/AboutReportWidget';
import TwoColumn from '../Widgets/TwoColumn';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import GenderWidget from '../Widgets/ChartWidgets/GenderWidget';
import AgeWidget from '../Widgets/ChartWidgets/AgeWidget';
import VisitorsWidget from '../Widgets/ChartWidgets/VisitorsWidget';
import Title from 'components/admin/ContentBuilder/Widgets/Title';
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import ActiveUsersWidget from '../Widgets/ChartWidgets/ActiveUsersWidget';
import SurveyResultsWidget from '../Widgets/SurveyResultsWidget';
import MostVotedIdeasWidget from '../Widgets/MostVotedIdeasWidget';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import getProjectPeriod from 'containers/Admin/reporting/utils/getProjectPeriod';
import { getTemplateData } from './getTemplateData';

interface Props {
  reportId: string;
  projectId: string;
}

const ProjectTemplate = ({ reportId, projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const phases = usePhases(projectId);

  if (!project || isNilOrError(phases)) return null;

  const { participationMethod, phaseId } = getTemplateData(
    project.data,
    phases
  );

  const hasPhases =
    project.data.attributes.process_type === 'continuous' && phases.length > 0;

  const projectPeriod = hasPhases
    ? getProjectPeriod(phases)
    : { startAt: undefined, endAt: moment().format('YYYY-MM-DD') };

  return (
    <Element id="project-report-template" is={Box} canvas>
      <AboutReportWidget
        reportId={reportId}
        projectId={projectId}
        {...projectPeriod}
      />
      <Title text={formatMessage(messages.reportSummary)} />
      <Text text={formatMessage(messages.reportSummaryDescription)} />
      <WhiteSpace />
      <Title text={formatMessage(messages.projectResults)} />
      <Text text={formatMessage(messages.descriptionPlaceHolder)} />
      <ActiveUsersWidget
        projectId={projectId}
        title={formatMessage(ActiveUsersWidget.craft.custom.title)}
        {...projectPeriod}
      />
      {participationMethod === 'native_survey' && (
        <SurveyResultsWidget
          projectId={projectId}
          phaseId={phaseId}
          title={formatMessage(SurveyResultsWidget.craft.custom.title)}
        />
      )}
      {participationMethod === 'ideation' && (
        <MostVotedIdeasWidget
          projectId={projectId}
          phaseId={phaseId}
          title={formatMessage(MostVotedIdeasWidget.craft.custom.title)}
          numberOfIdeas={5}
          collapseLongText={false}
        />
      )}
      <WhiteSpace />
      <Title text={formatMessage(messages.participants)} />
      <Text text={formatMessage(messages.descriptionPlaceHolder)} />
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
      <Text text={formatMessage(messages.descriptionPlaceHolder)} />
      <VisitorsWidget
        projectId={projectId}
        title={formatMessage(VisitorsWidget.craft.custom.title)}
        {...projectPeriod}
      />
    </Element>
  );
};

export default ProjectTemplate;
