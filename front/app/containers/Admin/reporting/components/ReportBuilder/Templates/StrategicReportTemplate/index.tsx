import React, { useContext } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { createMultiloc } from 'containers/Admin/reporting/utils/multiloc';

import { MessageDescriptor, useFormatMessageWithLocale } from 'utils/cl-intl';
import { withoutSpacing } from 'utils/textUtils';

import TextMultiloc from '../../Widgets/TextMultiloc';
import { TemplateContext } from '../context';

import messages from './messages';

const StrategicReportContent = () => {
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();

  if (!appConfigurationLocales) return null;

  const reportStats = createMultiloc(appConfigurationLocales, (locale) => {
    const formatMessage = (message: MessageDescriptor) =>
      formatMessageWithLocale(locale, message);

    return withoutSpacing`
      <h2>${formatMessage(messages.reportTitle)}</h2>
      <h3>${formatMessage(messages.executiveSummary)}</h3>
      <ul>
        <li><b>${formatMessage(messages.period)}</b>: PERIOD TODO</li>
        <li><b>${formatMessage(messages.community)}</b>: PARTICIPANTS TODO</li>
        <li><b>${formatMessage(messages.projects)}</b>: PROJECTS TODO</li>
      </ul>
    `;
  });

  return (
    <Element id="phase-report-template" is={Box} canvas>
      <TextMultiloc text={reportStats} />
    </Element>
  );
};

const StrategicReportTemplate = () => {
  const enabled = useContext(TemplateContext);

  if (enabled) {
    return <StrategicReportContent />;
  } else {
    return <Element id="strategic-report-template" is={Box} canvas />;
  }
};

export default StrategicReportTemplate;
