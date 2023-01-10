import React from 'react';

// craft
import { Element } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';

// components
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import TenantLogo from 'containers/MobileNavbar/TenantLogo';
import { NoWidgetSettings } from 'components/admin/ContentBuilder/Widgets/NoWidgetSettings';

// utils
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';

// hooks
import useReport from 'hooks/useReport';
import useUser from 'hooks/useUser';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useLocalize from 'hooks/useLocalize';

// typings
import { IPhaseData } from 'services/phases';

type Props = {
  reportId: string;
  projectId?: string;
};

// Return localised start & dates for project from phases
const getPhaseDates = (phases: IPhaseData[]) => {
  const startMoment = moment(phases[0]?.attributes.start_at, 'YYYY-MM-DD');
  const endMoment = moment(
    phases[phases.length - 1]?.attributes.end_at,
    'YYYY-MM-DD'
  );
  const startDate = startMoment.format('LL');
  const endDate = endMoment.format('LL');
  return { startDate, endDate };
};

const toPeriodString = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => `${startDate} - ${endDate}`;

const AboutReportWidget = ({ reportId, projectId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  // Title
  const report = useReport(reportId);
  const reportTitle = isNilOrError(report) ? null : report.attributes.name;

  // Project manager
  const userId = isNilOrError(report)
    ? null
    : report.relationships.owner.data.id;
  const user = useUser({ userId });
  const projectManager = isNilOrError(user)
    ? null
    : `${user.attributes.first_name} ${user.attributes.last_name}`;

  // Project name & time period
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const projectName = isNilOrError(project)
    ? ''
    : localize(project.attributes.title_multiloc);
  const hasPhases = !isNilOrError(phases) && phases.length !== 0;
  const projectPeriod = hasPhases
    ? toPeriodString(getPhaseDates(phases))
    : formatMessage(messages.continuousProject);

  return (
    <Box>
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        m="10px"
      >
        <TenantLogo />
      </Box>

      {reportTitle === null ? (
        <></>
      ) : (
        <Element id="about-title" is={Container} canvas>
          <Text
            text={`
              <h2>${reportTitle}</h2>
            `}
          />
        </Element>
      )}
      {projectManager === null ? (
        <></>
      ) : (
        <Element id="about-text" is={Container} canvas>
          <Text
            text={`
            <ul>
              <li>${formatMessage(messages.projectLabel, {
                projectsList: projectName,
              })}</li>
              <li>${formatMessage(messages.periodLabel, {
                startEndDates: projectPeriod,
              })}</li>
              <li>${formatMessage(messages.managerLabel, {
                managerName: projectManager,
              })}</li>
            </ul>
          `}
          />
        </Element>
      )}
    </Box>
  );
};

AboutReportWidget.craft = {
  props: {},
  related: {
    settings: NoWidgetSettings,
  },
  custom: {
    title: messages.aboutThisReport,
  },
};

export default AboutReportWidget;
