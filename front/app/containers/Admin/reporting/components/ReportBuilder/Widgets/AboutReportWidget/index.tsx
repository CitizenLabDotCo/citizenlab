import React from 'react';

// i18n
import messages from './messages';

// components
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import TenantLogo from 'containers/MobileNavbar/TenantLogo';
import { NoWidgetSettings } from 'components/admin/ContentBuilder/Widgets/NoWidgetSettings';
import { Element } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';
import PageBreakBox from '../../../../../../../components/admin/ContentBuilder/Widgets/PageBreakBox';

// hooks
import useReport from 'api/reports/useReport';
import useUserById from 'api/users/useUserById';
import useProjectById from 'api/projects/useProjectById';
import useLocalize from 'hooks/useLocalize';

// utils
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import { getFullName } from 'utils/textUtils';

type Props = {
  startAt?: string;
  endAt?: string;
  reportId: string;
  projectId?: string;
};

const toPeriodString = ({
  startAt,
  endAt,
}: {
  startAt: string;
  endAt: string;
}) => `${moment(startAt).format('LL')} - ${moment(endAt).format('LL')}`;

const AboutReportWidget = ({ reportId, projectId, startAt, endAt }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  // Title
  const { data: report } = useReport(reportId);
  const reportTitle = isNilOrError(report) ? null : report.data.attributes.name;

  // Project mod
  const userId = isNilOrError(report)
    ? null
    : report.data.relationships.owner.data.id;
  const { data: user } = useUserById(userId);
  const projectModerator = !user ? null : getFullName(user.data);

  // Project name & time period
  const { data: project } = useProjectById(projectId);
  const projectName = !project
    ? ''
    : localize(project.data.attributes.title_multiloc);

  const projectPeriodString =
    startAt && endAt ? toPeriodString({ startAt, endAt }) : '';

  return (
    <PageBreakBox>
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
      {projectModerator === null ? (
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
                startEndDates: projectPeriodString,
              })}</li>
              <li>${formatMessage(messages.managerLabel, {
                managerName: projectModerator,
              })}</li>
            </ul>
          `}
          />
        </Element>
      )}
    </PageBreakBox>
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
