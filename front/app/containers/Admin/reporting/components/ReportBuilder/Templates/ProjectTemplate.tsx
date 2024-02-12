import React from 'react';
import moment from 'moment';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// craft
import { Element } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';

// shared widgets
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

// report builder widgets
import TextMultiloc from '../Widgets/TextMultiloc';
import AboutReportWidget from '../Widgets/AboutReportWidget';
import TwoColumn from '../Widgets/TwoColumn';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import GenderWidget from '../Widgets/ChartWidgets/GenderWidget';
import AgeWidget from '../Widgets/ChartWidgets/AgeWidget';
import VisitorsWidget from '../Widgets/ChartWidgets/VisitorsWidget';
import ActiveUsersWidget from '../Widgets/ChartWidgets/ActiveUsersWidget';
import SurveyResultsWidget from '../Widgets/SurveyResultsWidget';
import MostReactedIdeasWidget from '../Widgets/MostReactedIdeasWidget';

// i18n
import { MessageDescriptor, useFormatMessageWithLocale } from 'utils/cl-intl';
import messages from './messages';
import { WIDGET_TITLES } from 'containers/Admin/reporting/components/ReportBuilder/Widgets';

// utils
import getProjectPeriod from 'containers/Admin/reporting/utils/getProjectPeriod';
import { getTemplateData } from './getTemplateData';
import { createMultiloc } from 'containers/Admin/reporting/utils/multiloc';
import { withoutSpacing } from 'utils/textUtils';

export interface Props {
  reportId: string;
  projectId: string;
}

const ProjectTemplate = ({ reportId, projectId }: Props) => {
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!project || !phases) return null;

  const { participationMethod, phaseId } = getTemplateData(phases.data);

  const hasPhases = phases.data.length > 0;

  const projectPeriod = hasPhases
    ? getProjectPeriod(phases.data)
    : { startAt: undefined, endAt: moment().format('YYYY-MM-DD') };

  if (!appConfigurationLocales) return null;

  const toMultilocParagraph = (
    title: MessageDescriptor,
    text: MessageDescriptor
  ) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return withoutSpacing`
        <h3>${formatMessageWithLocale(locale, title)}</h3>
        <p>${formatMessageWithLocale(locale, text)}</p>
      `;
    });
  };

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  return (
    <Element id="project-report-template" is={Box} canvas>
      <AboutReportWidget
        reportId={reportId}
        projectId={projectId}
        {...projectPeriod}
      />
      <TextMultiloc
        text={toMultilocParagraph(
          messages.reportSummary,
          messages.reportSummaryDescription
        )}
      />
      <WhiteSpace />
      <TextMultiloc
        text={toMultilocParagraph(
          messages.projectResults,
          messages.descriptionPlaceHolder
        )}
      />
      <WhiteSpace />
      <ActiveUsersWidget
        projectId={projectId}
        title={toMultiloc(WIDGET_TITLES.ActiveUsersWidget)}
        {...projectPeriod}
      />

      {participationMethod === 'native_survey' && (
        <SurveyResultsWidget
          title={toMultiloc(WIDGET_TITLES.SurveyResultsWidget)}
          phaseId={phaseId}
        />
      )}
      {participationMethod === 'ideation' && (
        <MostReactedIdeasWidget
          title={toMultiloc(WIDGET_TITLES.MostReactedIdeasWidget)}
          projectId={projectId}
          phaseId={phaseId}
          numberOfIdeas={5}
          collapseLongText={false}
        />
      )}
      <WhiteSpace />
      <TextMultiloc
        text={toMultilocParagraph(
          messages.participants,
          messages.descriptionPlaceHolder
        )}
      />
      <WhiteSpace />
      <TwoColumn columnLayout="1-1">
        <Element id="left" is={Container} canvas>
          <GenderWidget
            projectId={projectId}
            title={toMultiloc(WIDGET_TITLES.GenderWidget)}
            {...projectPeriod}
          />
        </Element>
        <Element id="right" is={Container} canvas>
          <AgeWidget
            projectId={projectId}
            title={toMultiloc(WIDGET_TITLES.AgeWidget)}
            {...projectPeriod}
          />
        </Element>
      </TwoColumn>
      <TextMultiloc
        text={toMultilocParagraph(
          messages.visitors,
          messages.descriptionPlaceHolder
        )}
      />
      <WhiteSpace />
      <VisitorsWidget
        projectId={projectId}
        title={toMultiloc(WIDGET_TITLES.VisitorsWidget)}
        {...projectPeriod}
      />
    </Element>
  );
};

export default ProjectTemplate;
