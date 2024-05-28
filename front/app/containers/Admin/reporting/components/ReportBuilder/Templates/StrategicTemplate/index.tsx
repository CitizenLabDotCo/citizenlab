import React, { useContext } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';
import { FormatMessage } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { createMultiloc } from 'containers/Admin/reporting/utils/multiloc';

import Container from 'components/admin/ContentBuilder/Widgets/Container';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import { MessageDescriptor, useFormatMessageWithLocale } from 'utils/cl-intl';
import { FormatMessageValues } from 'utils/cl-intl/useIntl';
import { withoutSpacing } from 'utils/textUtils';

import { WIDGET_TITLES } from '../../Widgets';
import ActiveUsersWidget from '../../Widgets/ChartWidgets/ActiveUsersWidget';
import RegistrationsWidget from '../../Widgets/ChartWidgets/RegistrationsWidget';
import VisitorsWidget from '../../Widgets/ChartWidgets/VisitorsWidget';
import TextMultiloc from '../../Widgets/TextMultiloc';
import TwoColumn from '../../Widgets/TwoColumn';
import { TemplateContext } from '../context';
import { getPeriod } from '../utils';

import messages from './messages';
import { createGSQuote, getComparedDateRange } from './utils';

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

  const buildMultiloc = (fn: (formatMessage: FormatMessage) => string) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      const formatMessage = (
        message: MessageDescriptor,
        values?: FormatMessageValues
      ) => formatMessageWithLocale(locale, message, values);

      return fn(formatMessage);
    });
  };

  const reportStats = buildMultiloc((formatMessage) => {
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

  const gsQuote = buildMultiloc(createGSQuote);

  const getSectionTitleAndDescription = (title: MessageDescriptor) => {
    return buildMultiloc((formatMessage) => {
      return withoutSpacing`
        <h3>${formatMessage(title)}</h3>
        <p>${formatMessage(messages.placeholderDescription)}</p>
      `;
    });
  };

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  const dateRange = {
    startAt: startDate,
    endAt: endDate,
  };

  const comparedDateRange = getComparedDateRange({ startDate, endDate });

  return (
    <Element id="strategic-report-template" is={Box} canvas>
      <TextMultiloc text={reportStats} />
      <WhiteSpace size="small" />
      <TextMultiloc text={gsQuote} />
      <WhiteSpace size="small" />
      <TextMultiloc
        text={getSectionTitleAndDescription(messages.participationIndicators)}
      />
      <WhiteSpace size="small" />
      <VisitorsWidget
        title={toMultiloc(WIDGET_TITLES.VisitorsWidget)}
        {...dateRange}
        {...comparedDateRange}
      />
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="1-1">
        <Element id="left" is={Container} canvas>
          <RegistrationsWidget
            title={toMultiloc(WIDGET_TITLES.RegistrationsWidget)}
            {...dateRange}
            {...comparedDateRange}
          />
        </Element>
        <Element id="right" is={Container} canvas>
          <ActiveUsersWidget
            title={toMultiloc(WIDGET_TITLES.ActiveUsersWidget)}
            {...dateRange}
            {...comparedDateRange}
            projectId={undefined}
          />
        </Element>
      </TwoColumn>
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
