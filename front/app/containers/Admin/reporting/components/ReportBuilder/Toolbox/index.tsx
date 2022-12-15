import React from 'react';

// components
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import SectionTitle from 'components/admin/ContentBuilder/Toolbox/SectionTitle';
import { Accordion } from '@citizenlab/cl2-component-library';
import TwoColumn from '../../../components/ReportBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import Image from 'components/admin/ContentBuilder/Widgets/Image';
import AnalyticsChartWidget from '../Widgets/AnalyticsChartWidget';

// types
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';

// Utils
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import moment from 'moment';

// Messages
import contentBuilderMessages from 'components/admin/ContentBuilder/messages';
import reportBuilderMessages from '../../../messages';
import textMessages from 'components/admin/ContentBuilder/Widgets/Text/messages';
import chartMessages from '../Widgets/AnalyticsChartWidget/messages';

const ReportBuilderToolbox = () => {
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
      </Accordion>
    </Container>
  );
};

export default ReportBuilderToolbox;
