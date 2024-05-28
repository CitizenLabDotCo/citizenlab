import React, { useContext } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { createMultiloc } from 'containers/Admin/reporting/utils/multiloc';

import { MessageDescriptor, useFormatMessageWithLocale } from 'utils/cl-intl';
import { FormatMessageValues } from 'utils/cl-intl/useIntl';
import { withoutSpacing } from 'utils/textUtils';

import TextMultiloc from '../../Widgets/TextMultiloc';
import { TemplateContext } from '../context';
import { getPeriod } from '../utils';

import messages from './messages';

interface Props {
  startDate: string;
  endDate: string;
}

// TODO remove
const error = console.error.bind(console);

console.error = (...args: any[]) => {
  if (args[0].code === 'MISSING_TRANSLATION') return;
  error(...args);
};

const StrategicTemplateContent = ({ startDate, endDate }: Props) => {
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();

  if (!appConfigurationLocales) return null;

  const reportStats = createMultiloc(appConfigurationLocales, (locale) => {
    const formatMessage = (
      message: MessageDescriptor,
      values?: FormatMessageValues
    ) => formatMessageWithLocale(locale, message, values);

    const period = getPeriod({
      startAt: startDate,
      endAt: endDate,
      formatMessage,
    });

    return withoutSpacing`
      <h2>${formatMessage(messages.reportTitle)}</h2>
      <h3>${formatMessage(messages.executiveSummary)}</h3>
      <ul>
        ${period ? `<li>${period}</li>` : ''}
        <li><b>${formatMessage(
          messages.community
        )}</b>: ${` PARTICIPANTS TODO`}</li>
        <li><b>${formatMessage(messages.projects)}</b>: ${` PROJECTS TODO`}</li>
      </ul>
    `;
  });

  const gsQuote = createMultiloc(appConfigurationLocales, (locale) => {
    const formatMessage = (
      message: MessageDescriptor,
      values?: FormatMessageValues
    ) => formatMessageWithLocale(locale, message, values);

    return `
      <p><strong>${formatMessage(messages.placeholderQuote)}</strong></p>
      <p class="ql-align-center">
        <strong>
          (NAME),
          ${formatMessage(messages.clGSManager)}
        </strong>
      </p>
    `;
  });

  console.log({ gsQuote });

  return (
    <Element id="strategic-report-template" is={Box} canvas>
      <TextMultiloc text={reportStats} />
      <TextMultiloc text={gsQuote} />
    </Element>
  );
};

const StrategicTemplate = (props: Props) => {
  const enabled = useContext(TemplateContext);

  if (enabled) {
    return <StrategicTemplateContent {...props} />;
  } else {
    return <Element id="strategic-report-template" is={Box} canvas />;
  }
};

export default StrategicTemplate;
