import React from 'react';

// components
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import SectionTitle from 'components/admin/ContentBuilder/Toolbox/SectionTitle';
import { Accordion } from '@citizenlab/cl2-component-library';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import Image from 'components/admin/ContentBuilder/Widgets/Image';
import AnalyticsChartWidget from '../Widgets/AnalyticsChartWidget';
import AboutReportWidget from '../Widgets/AboutReportWidget';
import SurveyResultsWidget from '../Widgets/SurveyResultsWidget';

// types
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';

// Utils
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import moment from 'moment';

// Messages
import contentBuilderMessages from '../../../../../../modules/commercial/content_builder/admin/messages';
import reportBuilderMessages from '../../../messages';
import textMessages from 'components/admin/ContentBuilder/Widgets/Text/messages';
import chartMessages from '../Widgets/AnalyticsChartWidget/messages';
import aboutMessages from '../Widgets/AboutReportWidget/messages';
import surveyResultMessages from '../Widgets/SurveyResultsWidget/messages';

type ReportBuilderToolboxProps = {
  reportId: string;
};

const ReportBuilderToolbox = ({ reportId }: ReportBuilderToolboxProps) => {
  const { formatMessage } = useIntl();

  // Default end date for charts (today)
  const chartEndDate = moment().format('YYYY-MM-DDTHH:mm:ss.sss');

  return (
    <Container>
      <Accordion
        isOpenByDefault={true}
        title={
          <SectionTitle>
            <FormattedMessage {...contentBuilderMessages.layout} />
          </SectionTitle>
        }
      >
        <DraggableElement
          id="e2e-draggable-two-column"
          component={<TwoColumn columnLayout="1-1" />}
          icon="layout-2column-1"
          label={formatMessage(TwoColumn.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-three-column"
          component={<ThreeColumn />}
          icon="layout-3column"
          label={formatMessage(ThreeColumn.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-white-space"
          component={<WhiteSpace size="small" />}
          icon="layout-white-space"
          label={formatMessage(WhiteSpace.craft.custom.title)}
        />
      </Accordion>

      <Accordion
        isOpenByDefault={true}
        title={
          <SectionTitle>
            <FormattedMessage {...contentBuilderMessages.content} />
          </SectionTitle>
        }
      >
        <DraggableElement
          id="e2e-draggable-about-report"
          component={<AboutReportWidget reportId={reportId} />}
          icon="section-image-text"
          label={formatMessage(aboutMessages.aboutThisReport)}
        />
        <DraggableElement
          id="e2e-draggable-text"
          component={<Text text={formatMessage(textMessages.textValue)} />}
          icon="text"
          label={formatMessage(Text.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-image"
          component={<Image alt="" />}
          icon="image"
          label={formatMessage(Image.craft.custom.title)}
        />
      </Accordion>

      <Accordion
        isOpenByDefault={true}
        title={
          <SectionTitle>
            <FormattedMessage {...reportBuilderMessages.chartsSection} />
          </SectionTitle>
        }
      >
        <DraggableElement
          id="e2e-draggable-visitors-timeline-widget"
          component={
            <AnalyticsChartWidget
              chartType="VisitorsCard"
              title={formatMessage(chartMessages.visitorTimeline)}
              projectId={undefined}
              startAt={undefined}
              endAt={chartEndDate}
            />
          }
          icon="chart-bar"
          label={formatMessage(chartMessages.visitorTimeline)}
        />
        <DraggableElement
          id="e2e-draggable-visitors-traffic-sources-widget"
          component={
            <AnalyticsChartWidget
              chartType="VisitorsTrafficSourcesCard"
              title={formatMessage(chartMessages.trafficSources)}
              projectId={undefined}
              startAt={undefined}
              endAt={chartEndDate}
            />
          }
          icon="chart-bar"
          label={formatMessage(chartMessages.trafficSources)}
        />
        <DraggableElement
          id="e2e-draggable-users-by-gender-widget"
          component={
            <AnalyticsChartWidget
              chartType="GenderChart"
              title={formatMessage(chartMessages.usersByGender)}
              projectId={undefined}
              startAt={undefined}
              endAt={chartEndDate}
            />
          }
          icon="chart-bar"
          label={formatMessage(chartMessages.usersByGender)}
        />
        <DraggableElement
          id="e2e-draggable-users-by-age-widget"
          component={
            <AnalyticsChartWidget
              chartType="AgeChart"
              title={formatMessage(chartMessages.usersByAge)}
              projectId={undefined}
              startAt={undefined}
              endAt={chartEndDate}
            />
          }
          icon="chart-bar"
          label={formatMessage(chartMessages.usersByAge)}
        />
        {
          // TODO: CL-2307 Only show this if there are surveys in the platform
        }
        <DraggableElement
          id="e2e-draggable-survey-results-widget"
          component={
            <SurveyResultsWidget
              title={formatMessage(surveyResultMessages.surveyResults)}
              projectId="d6827fd0-29bf-4e1d-8861-420386a61c34"
              phaseId="350adbb0-6ca5-48aa-aedd-e7d7d2e5fc6b"
            />
          }
          icon="survey"
          label={formatMessage(surveyResultMessages.surveyResults)}
        />
      </Accordion>
    </Container>
  );
};

export default ReportBuilderToolbox;
