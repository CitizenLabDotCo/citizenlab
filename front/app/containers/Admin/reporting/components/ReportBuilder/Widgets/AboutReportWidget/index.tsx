import React from 'react';

// i18n
import messages from './messages';
import { useFormatMessageWithLocale } from 'utils/cl-intl';

// components
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import { NoWidgetSettings } from 'components/admin/ContentBuilder/Widgets/NoWidgetSettings';
import { Element } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import TenantLogo from 'containers/MainHeader/Components/TenantLogo';

// hooks
import useReport from 'api/reports/useReport';
import useUserById from 'api/users/useUserById';
import useProjectById from 'api/projects/useProjectById';
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';

// utils
import { keys } from 'utils/helperUtils';
import { getFullName } from 'utils/textUtils';
import { getPeriod } from './utils';
import {
  createMultiloc,
  // formatMultiloc,
} from 'containers/Admin/reporting/utils/multiloc';

type Props = {
  startAt?: string;
  endAt?: string | null;
  reportId: string;
  projectId?: string;
};

const AboutReportWidget = ({ reportId, projectId, startAt, endAt }: Props) => {
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const px = useReportDefaultPadding();

  // Title
  const { data: report } = useReport(reportId);
  const reportTitle = report?.data.attributes.name;

  // Project mod
  const userId = report?.data.relationships.owner.data.id;
  const { data: user } = useUserById(userId);
  const projectModerator = !user ? null : getFullName(user.data);

  // Project name & time period
  const { data: project } = useProjectById(projectId);
  if (!project) return null;

  const projectTitle = project.data.attributes.title_multiloc;
  const locales = keys(projectTitle);

  const reportTitleMultiloc = createMultiloc(locales, (_locale) => {
    // TODO
    return `<h2>${reportTitle}</h2>`;
  });

  const aboutTextMultiloc = createMultiloc(locales, (locale) => {
    const formatMessage = (message, values) =>
      formatMessageWithLocale(locale, message, values);
    const period = getPeriod({ startAt, endAt, formatMessage });

    return `
      <ul>
        <li>${formatMessage(messages.projectLabel, {
          projectsList: projectTitle[locale] ?? '',
        })}</li>
        ${period ? `<li>${period}</li>` : ''}
        <li>${formatMessage(messages.managerLabel, {
          managerName: projectModerator,
        })}</li>
      </ul>
    `;
  });

  return (
    <PageBreakBox px={px}>
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
          <TextMultiloc text={reportTitleMultiloc} />
        </Element>
      )}
      {projectModerator === null ? (
        <></>
      ) : (
        <Element id="about-text" is={Container} canvas>
          <TextMultiloc text={aboutTextMultiloc} />
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
