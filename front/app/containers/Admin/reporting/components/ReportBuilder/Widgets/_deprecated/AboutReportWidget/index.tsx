import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import useProjectById from 'api/projects/useProjectById';
import useReport from 'api/reports/useReport';
import useUserById from 'api/users/useUserById';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { createMultiloc } from 'containers/Admin/reporting/utils/multiloc';
import TenantLogo from 'containers/MainHeader/Components/TenantLogo';

import Container from 'components/admin/ContentBuilder/Widgets/Container';
import { NoWidgetSettings } from 'components/admin/ContentBuilder/Widgets/NoWidgetSettings';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { useFormatMessageWithLocale } from 'utils/cl-intl';
import { getFullName, withoutSpacing } from 'utils/textUtils';

import TextMultiloc from '../../TextMultiloc';

import messages from './messages';
import { getPeriod } from './utils';

export type Props = {
  startAt?: string;
  endAt?: string | null;
  reportId: string;
  projectId?: string;
};

const AboutReportWidget = ({ reportId, projectId, startAt, endAt }: Props) => {
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const locales = useAppConfigurationLocales();

  // Title
  const { data: report } = useReport(reportId);

  // Project mod
  const userId = report?.data.relationships.owner?.data.id;
  const { data: user } = useUserById(userId);
  const projectModerator = !user ? null : getFullName(user.data);

  // Project name & time period
  const { data: project } = useProjectById(projectId);
  if (!report || !locales || !projectModerator) return null;

  const reportTitle = report.data.attributes.name;
  const projectTitle = project?.data.attributes.title_multiloc;

  const reportTitleMultiloc = reportTitle
    ? createMultiloc(locales, (_locale) => {
        return `<h2>${reportTitle}</h2>`;
      })
    : null;

  const aboutTextMultiloc = createMultiloc(locales, (locale) => {
    const formatMessage = (message, values) =>
      formatMessageWithLocale(locale, message, values);
    const period = getPeriod({ startAt, endAt, formatMessage });

    return withoutSpacing`
      <ul>
        <li>${formatMessage(messages.projectLabel, {
          projectsList: projectTitle?.[locale] ?? '',
        })}</li>
        ${period ? `<li>${period}</li>` : ''}
        <li>${formatMessage(messages.managerLabel, {
          managerName: projectModerator,
        })}</li>
      </ul>
    `;
  });

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

      {reportTitleMultiloc && (
        <Element id="about-title" is={Container} canvas>
          <TextMultiloc text={reportTitleMultiloc} />
        </Element>
      )}
      <Element id="about-text" is={Container} canvas>
        <TextMultiloc text={aboutTextMultiloc} />
      </Element>
    </PageBreakBox>
  );
};

AboutReportWidget.craft = {
  props: {},
  related: {
    settings: NoWidgetSettings,
  },
};

/** @deprecated This widget should not be used for new reports anymore */
export const aboutReportTitle = messages.aboutThisReport;

/** @deprecated This widget should not be used for new reports anymore */
export default AboutReportWidget;
