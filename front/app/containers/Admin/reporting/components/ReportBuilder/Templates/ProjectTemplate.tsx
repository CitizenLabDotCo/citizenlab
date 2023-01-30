import React from 'react';

// hooks
import useProject from 'hooks/useProject';
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
import MostVotedIdeasWidget from '../Widgets/MostVotedIdeasWidget';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import getProjectPeriod from 'containers/Admin/reporting/utils/getProjectPeriod';
import moment from 'moment';
import { IProjectData } from 'services/projects';
import { IPhaseData } from 'services/phases';

interface Props {
  reportId: string;
  projectId: string;
}

interface TemplateData {
  participationMethod: 'ideation' | 'native_survey' | 'other';
  phaseId?: string;
}

const getTemplateData = (
  project: IProjectData,
  phases: IPhaseData[]
): TemplateData => {
  const hasPhases = project.attributes.process_type === 'continuous';

  if (hasPhases) {
    for (const phase of phases) {
      const participationMethod = phase.attributes.participation_method;

      if (
        participationMethod === 'ideation' ||
        participationMethod === 'native_survey'
      ) {
        return {
          participationMethod,
          phaseId: phase.id,
        };
      }
    }

    return {
      participationMethod: 'other',
      phaseId: undefined,
    };
  }

  const participationMethod = project.attributes.participation_method;

  if (
    participationMethod === 'ideation' ||
    participationMethod === 'native_survey'
  ) {
    return {
      participationMethod,
      phaseId: undefined,
    };
  }

  return {
    participationMethod: 'other',
    phaseId: undefined,
  };
};

const ProjectTemplate = ({ reportId, projectId }: Props) => {
  const { formatMessage } = useIntl();
  const project = useProject({ projectId });
  const phases = usePhases(projectId);

  if (isNilOrError(project) || isNilOrError(phases)) return null;

  const { participationMethod, phaseId } = getTemplateData(project, phases);

  const hasPhases =
    project.attributes.process_type === 'continuous' && phases.length > 0;

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
      <Title text={formatMessage(messages.participants)} />
      <Text text={formatMessage(messages.descriptionPlaceHolder)} />
      <WhiteSpace />
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
      <WhiteSpace />
      <VisitorsWidget
        projectId={projectId}
        title={formatMessage(VisitorsWidget.craft.custom.title)}
        {...projectPeriod}
      />
    </Element>
  );
};

export default ProjectTemplate;
