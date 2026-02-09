import React, { useContext } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';
import { FormatMessage } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
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
import { parseBackendDateString } from 'utils/dateUtils';
import { withoutSpacing } from 'utils/textUtils';

import {
  CUSTOM_TEMPLATE_WIDGET_TITLES,
  WIDGET_TITLES,
  WIDGETS,
} from '../../Widgets';
import {
  INPUT_TYPES,
  isSupportedField,
} from '../../Widgets/ChartWidgets/DemographicsWidget/Settings';
const {
  DemographicsWidget,
  MethodsUsedWidget,
  ParticipantsWidget,
  ParticipationWidget,
  RegistrationsWidget,
  VisitorsTrafficSourcesWidget,
  VisitorsWidget,
  ProjectsWidget,
  TwoColumn,
  TextMultiloc,
  ImageMultiloc,
} = WIDGETS;
import { TemplateContext } from '../context';
import { getPeriod } from '../utils';

import messages from './messages';
import {
  getCommunity,
  getComparedDateRange,
  getDateLastReport,
  getProjects,
} from './utils';

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
  const { data: appConfiguration } = useAppConfiguration();
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

  if (
    !appConfigurationLocales ||
    !userFields ||
    !stats ||
    !projects ||
    !appConfiguration ||
    !formatMessageWithLocale
  ) {
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

    const dateLastReport = getDateLastReport({ formatMessage });

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
        ${dateLastReport}
        ${community}
        ${projectsStat}
      </ul>
      <p>
      <b>
        ${formatMessage(messages.comments)}:
      </b>
      </p>
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

  const toMultiloc = (
    message: MessageDescriptor,
    values?: FormatMessageValues
  ) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message, values);
    });
  };

  const toTitleMultiloc = (
    message: MessageDescriptor,
    variant: 'h1' | 'h3'
  ) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return `<${variant}>${formatMessageWithLocale(
        locale,
        message
      )}</${variant}>`;
    });
  };

  const toTextMultiloc = (
    message: MessageDescriptor,
    bold?: boolean,
    values?: FormatMessageValues
  ) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      const text = formatMessageWithLocale(locale, message, values);
      const html = bold ? `<p><b>${text}</b></p>` : `<p>${text}</p>`;
      return html;
    });
  };

  const supportedEnabledFields = userFields.data
    .filter(isSupportedField)
    .filter((field) => field.attributes.enabled);

  // Format the startDate for display in widget titles
  const formattedStartDate =
    parseBackendDateString(startDate).toLocaleDateString();

  return (
    <Element id="platform-report-template" is={Box} canvas>
      <ImageMultiloc
        image={{
          imageUrl: appConfiguration.data.attributes.logo?.medium ?? undefined,
        }}
        stretch={false}
      />
      {/* ----- EXECUTIVE SUMMARY ----- */}
      <TextMultiloc text={reportStats} />
      <WhiteSpace size="small" />

      {/* ----- TOP-LEVEL PARTICIPATION INDICATORS ----- */}
      <TextMultiloc
        text={getSectionTitleAndDescription(
          messages.participationIndicators,
          messages.participationIndicatorsDescription
        )}
      />
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="1-1">
        {/* VISITORS */}
        <Element id="column-visitors-left" is={Container} canvas>
          <VisitorsWidget
            title={toMultiloc(
              CUSTOM_TEMPLATE_WIDGET_TITLES.VisitorsWidgetFromStart
            )}
            endAt={dateRange.endAt}
          />
        </Element>
        <Element id="column-visitors-right" is={Container} canvas>
          <VisitorsWidget
            title={toMultiloc(
              CUSTOM_TEMPLATE_WIDGET_TITLES.VisitorsWidgetSince,
              { date: formattedStartDate }
            )}
            {...dateRange}
            {...comparedDateRange}
          />
        </Element>
      </TwoColumn>
      <TwoColumn columnLayout="1-1">
        {/* TRAFFIC SOURCES */}
        <Element id="column-traffic-sources-left" is={Container} canvas>
          <VisitorsTrafficSourcesWidget
            title={toMultiloc(
              CUSTOM_TEMPLATE_WIDGET_TITLES.TrafficSourcesWidgetFromStart
            )}
            endAt={dateRange.endAt}
          />
        </Element>
        <Element id="column-traffic-sources-right" is={Container} canvas>
          <VisitorsTrafficSourcesWidget
            title={toMultiloc(
              CUSTOM_TEMPLATE_WIDGET_TITLES.TrafficSourcesWidgetSince,
              { date: formattedStartDate }
            )}
            {...dateRange}
            {...comparedDateRange}
          />
        </Element>
      </TwoColumn>
      <TwoColumn columnLayout="1-1">
        {/* DEVICE TYPE */}
        <Element id="column-device-type-left" is={Container} canvas>
          <TextMultiloc
            text={toTextMultiloc(messages.deviceTypeFromStart, true)}
          />
          <ImageMultiloc />
        </Element>
        <Element id="column-device-type-right" is={Container} canvas>
          <TextMultiloc
            text={toTextMultiloc(messages.deviceTypeSince, true, {
              date: formattedStartDate,
            })}
          />
          <ImageMultiloc />
        </Element>
      </TwoColumn>

      {/* COMMENTS */}
      <WhiteSpace size="small" withDivider />
      <TextMultiloc text={toTitleMultiloc(messages.comments, 'h3')} />
      <WhiteSpace size="small" withDivider />

      <TwoColumn columnLayout="1-1">
        {/* REGISTRATIONS */}
        <Element id="column-registrations-left" is={Container} canvas>
          <RegistrationsWidget
            title={toMultiloc(
              CUSTOM_TEMPLATE_WIDGET_TITLES.RegistrationsWidgetFromStart
            )}
            endAt={dateRange.endAt}
          />
        </Element>
        <Element id="column-registrations-right" is={Container} canvas>
          <RegistrationsWidget
            title={toMultiloc(
              CUSTOM_TEMPLATE_WIDGET_TITLES.RegistrationsWidgetSince,
              { date: formattedStartDate }
            )}
            {...dateRange}
            {...comparedDateRange}
          />
        </Element>
      </TwoColumn>
      <TwoColumn columnLayout="1-1">
        {/* PARTICIPANTS */}
        <Element id="column-participants-left" is={Container} canvas>
          <ParticipantsWidget
            title={toMultiloc(
              CUSTOM_TEMPLATE_WIDGET_TITLES.ParticipantsWidgetFromStart
            )}
            endAt={dateRange.endAt}
          />
        </Element>
        <Element id="column-participants-right" is={Container} canvas>
          <ParticipantsWidget
            title={toMultiloc(
              CUSTOM_TEMPLATE_WIDGET_TITLES.ParticipantsWidgetSince,
              { date: formattedStartDate }
            )}
            {...dateRange}
            {...comparedDateRange}
          />
        </Element>
      </TwoColumn>
      <TwoColumn columnLayout="1-1">
        {/* EMAILS */}
        <Element id="column-emails-left" is={Container} canvas>
          <TextMultiloc text={toTextMultiloc(messages.emailsFromStart, true)} />
          <ImageMultiloc />
        </Element>
        <Element id="column-emails-right" is={Container} canvas>
          <TextMultiloc
            text={toTextMultiloc(messages.emailsSince, true, {
              date: formattedStartDate,
            })}
          />
          <ImageMultiloc />
        </Element>
      </TwoColumn>

      {/* COMMENTS */}
      <WhiteSpace size="small" withDivider />
      <TextMultiloc text={toTitleMultiloc(messages.comments, 'h3')} />
      <WhiteSpace size="small" withDivider />

      {/* ----- TOP-LEVEL INCLUSION INDICATORS ----- */}
      <TwoColumn columnLayout="1-1">
        <Element id="column-inclusion-left" is={Container} canvas>
          <TextMultiloc
            text={getSectionTitleAndDescription(
              messages.inclusionIndicators,
              messages.inclusionIndicatorsDescription
            )}
          />
        </Element>
        <Element id="column-inclusion-right" is={Container} canvas>
          <TextMultiloc
            text={toTextMultiloc(messages.yourRegistrationQuestions, true)}
          />
          <ImageMultiloc />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      {/* DEMOGRAPHICS */}
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
          <TextMultiloc
            text={toTextMultiloc(messages.representativenessDashboard, true)}
          />
          <ImageMultiloc
            stretch
            alt={toMultiloc(messages.imageInclusionLabel)}
          />
        </Element>
      ))}

      {/* COMMENTS */}
      <WhiteSpace size="small" withDivider />
      <TextMultiloc text={toTitleMultiloc(messages.comments, 'h3')} />
      <WhiteSpace size="small" withDivider />

      {/* ----- YOUR PROJECTS ----- */}
      <TextMultiloc
        text={getSectionTitleAndDescription(
          messages.yourProjects,
          messages.yourProjectsDescription
        )}
      />
      <WhiteSpace size="small" />
      {/* PROJECTS */}
      <ProjectsWidget
        title={toMultiloc(WIDGET_TITLES.ProjectsWidget)}
        {...dateRange}
      />
      <WhiteSpace size="small" />
      {/* METHODS USED */}
      <MethodsUsedWidget
        title={toMultiloc(WIDGET_TITLES.MethodsUsedWidget)}
        {...dateRange}
        {...comparedDateRange}
      />

      <TwoColumn columnLayout="1-1">
        {/* INPUT STATUS */}
        <Element id="column-input-status-left" is={Container} canvas>
          <TextMultiloc
            text={toTextMultiloc(messages.inputStatusFromStart, true)}
          />
          <ImageMultiloc />
        </Element>
        <Element id="column-input-status-right" is={Container} canvas>
          <TextMultiloc
            text={toTextMultiloc(messages.inputStatusSince, true, {
              date: formattedStartDate,
            })}
          />
          <ImageMultiloc />
        </Element>
      </TwoColumn>

      {/* PARTICIPATION */}
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

      {/* COMMENTS */}
      <WhiteSpace size="small" withDivider />
      <TextMultiloc text={toTitleMultiloc(messages.comments, 'h3')} />
      <WhiteSpace size="small" withDivider />

      {/* ----- INTERNAL ORGANISATION ----- */}
      <TextMultiloc
        text={toTitleMultiloc(messages.internalOrganization, 'h3')}
      />

      <TwoColumn columnLayout="1-1">
        {/* ADMIN & PROJECT MANAGERS */}
        <Element id="column-admin-pms-left" is={Container} canvas>
          <TextMultiloc text={toTextMultiloc(messages.admins, true)} />
          <ImageMultiloc />
        </Element>
        <Element id="column-admin-pms-right" is={Container} canvas>
          <TextMultiloc text={toTextMultiloc(messages.projectManagers, true)} />
          <ImageMultiloc />
        </Element>
      </TwoColumn>

      {/* COMMENTS */}
      <WhiteSpace size="small" withDivider />
      <TextMultiloc text={toTitleMultiloc(messages.comments, 'h3')} />
      <WhiteSpace size="small" withDivider />

      {/* ----- GOALS & ENDING ----- */}
      <TextMultiloc text={toTitleMultiloc(messages.goals, 'h3')} />
      <TwoColumn columnLayout="1-1">
        <Element id="column-goals-left" is={Container} canvas>
          <TextMultiloc text={undefined} />
        </Element>
        <Element id="column-goals-right" is={Container} canvas>
          <ImageMultiloc />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" withDivider />

      <TextMultiloc text={toTextMultiloc(messages.ending)} />
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
