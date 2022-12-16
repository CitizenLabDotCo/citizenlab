import React from 'react';

// craft
import { Element, UserComponent } from '@craftjs/core';
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

// hooks
import useReport from 'hooks/useReport';
import useUser from 'hooks/useUser';

type AboutReportWidgetProps = {
  reportId: string;
};

const AboutReportWidget: UserComponent = ({
  reportId,
}: AboutReportWidgetProps) => {
  const { formatMessage } = useIntl();

  const report = useReport(reportId);
  const reportTitle = isNilOrError(report) ? null : report.attributes.name;

  const userId = isNilOrError(report)
    ? null
    : report.relationships.owner.data.id;
  const user = useUser({ userId });
  const projectManager = isNilOrError(user)
    ? null
    : `${user.attributes.first_name} ${user.attributes.last_name}`;

  // TODO: initialise these from the report projects when available
  const project = 'Project name';
  const projectPeriod = '12/03/2022 - 15/12/2022';

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
              <li>${formatMessage(messages.projectsLabel, {
                projectsList: project,
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
