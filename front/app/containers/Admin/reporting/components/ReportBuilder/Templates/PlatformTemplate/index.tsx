import React, { useContext } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';
import { FormatMessage } from 'typings';

import { useProjects } from 'api/graph_data_units';
import { ProjectReportsPublicationStatus } from 'api/graph_data_units/requestTypes';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useAppConfigurationLocales, {
  createMultiloc,
} from 'hooks/useAppConfigurationLocales';

import useParticipants from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/ParticipantsWidget/useParticipants';

import Container from 'components/admin/ContentBuilder/Widgets/Container';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import { MessageDescriptor, useFormatMessageWithLocale } from 'utils/cl-intl';
import { FormatMessageValues } from 'utils/cl-intl/useIntl';
import { withoutSpacing } from 'utils/textUtils';

import { WIDGET_TITLES } from '../../Widgets';
import DemographicsWidget from '../../Widgets/ChartWidgets/DemographicsWidget';
import {
  INPUT_TYPES,
  isSupportedField,
} from '../../Widgets/ChartWidgets/DemographicsWidget/Settings';
import MethodsUsedWidget from '../../Widgets/ChartWidgets/MethodsUsedWidget';
import ParticipantsWidget from '../../Widgets/ChartWidgets/ParticipantsWidget';
import ParticipationWidget from '../../Widgets/ChartWidgets/ParticipationWidget';
import RegistrationsWidget from '../../Widgets/ChartWidgets/RegistrationsWidget';
import VisitorsWidget from '../../Widgets/ChartWidgets/VisitorsWidget';
import ProjectsWidget from '../../Widgets/ProjectsWidget';
import TextMultiloc from '../../Widgets/TextMultiloc';
import TwoColumn from '../../Widgets/TwoColumn';
import { TemplateContext } from '../context';
import { getPeriod } from '../utils';

import messages from './messages';
import { getCommunity, getComparedDateRange, getProjects } from './utils';

interface Props {
  startDate: string;
  endDate: string;
  publicationStatuses?: ProjectReportsPublicationStatus[];
}

const PlatformTemplateContent = ({
  startDate,
  endDate,
  publicationStatuses = ['published'],
}: Props) => {
  const dateRange = {
    startAt: startDate,
    endAt: endDate,
  };

  const comparedDateRange = getComparedDateRange({ startDate, endDate });

  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();
  const { data: userFields } = useUserCustomFields({
    inputTypes: INPUT_TYPES,
  });

  const { stats } = useParticipants({
    project_id: undefined,
    start_at: startDate,
    end_at: endDate,
    resolution: 'month',
    compare_start_at: comparedDateRange.compareStartAt,
    compare_end_at: comparedDateRange.compareEndAt,
  });

  const { data: projects } = useProjects({
    start_at: startDate,
    end_at: endDate,
    publication_statuses: publicationStatuses,
  });

  if (!appConfigurationLocales || !userFields || !stats || !projects) {
    return null;
  }

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

    const community = getCommunity({
      participantsNumber: stats.participants.value,
      formatMessage,
    });

    const projectsStat = getProjects({
      projectsNumber: projects.data.attributes.projects.length,
      formatMessage,
    });

    return withoutSpacing`
      <h2>${formatMessage(messages.reportTitle)}</h2>
      <h3>${formatMessage(messages.executiveSummary)}</h3>
      <ul>
        ${period ? `<li>${period}</li>` : ''}
        ${community}
        ${projectsStat}
      </ul>
    `;
  });

  const getSectionTitleAndDescription = (
    title: MessageDescriptor,
    description: MessageDescriptor
  ) => {
    return buildMultiloc((formatMessage) => {
      return withoutSpacing`
        <h3>${formatMessage(title)}</h3>
        <p>${formatMessage(description)}</p>
      `;
    });
  };

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  const supportedEnabledFields = userFields.data
    .filter(isSupportedField)
    .filter((field) => field.attributes.enabled);

  return (
    <Element id="platform-report-template" is={Box} canvas>
      <TextMultiloc text={reportStats} />
      <WhiteSpace size="small" />
      <TextMultiloc
        text={getSectionTitleAndDescription(
          messages.participationIndicators,
          messages.participationIndicatorsDescription
        )}
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
          <ParticipantsWidget
            title={toMultiloc(WIDGET_TITLES.ParticipantsWidget)}
            {...dateRange}
            {...comparedDateRange}
          />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TextMultiloc
        text={getSectionTitleAndDescription(
          messages.inclusionIndicators,
          messages.inclusionIndicatorsDescription
        )}
      />
      <WhiteSpace size="small" />
      {supportedEnabledFields.map((field) => (
        <Element is={Container} canvas key={field.id}>
          <DemographicsWidget
            title={
              field.attributes.code === 'birthyear'
                ? toMultiloc(messages.age)
                : field.attributes.title_multiloc
            }
            {...dateRange}
            customFieldId={field.id}
          />
        </Element>
      ))}
      <WhiteSpace size="small" />
      <TextMultiloc
        text={getSectionTitleAndDescription(
          messages.yourProjects,
          messages.yourProjectsDescription
        )}
      />
      <WhiteSpace size="small" />
      <ProjectsWidget
        title={toMultiloc(WIDGET_TITLES.ProjectsWidget)}
        {...dateRange}
      />
      <WhiteSpace size="small" />
      <MethodsUsedWidget
        title={toMultiloc(WIDGET_TITLES.MethodsUsedWidget)}
        {...dateRange}
        {...comparedDateRange}
      />
      <WhiteSpace size="small" />
      <ParticipationWidget
        title={toMultiloc(WIDGET_TITLES.ParticipationWidget)}
        {...dateRange}
        {...comparedDateRange}
        participationTypes={{
          inputs: true,
          comments: true,
          votes: true,
        }}
      />
    </Element>
  );
};

const PlatformTemplate = (props: Props) => {
  const enabled = useContext(TemplateContext);

  if (enabled) {
    return <PlatformTemplateContent {...props} />;
  } else {
    return <Element id="platform-report-template" is={Box} canvas />;
  }
};

export default PlatformTemplate;
