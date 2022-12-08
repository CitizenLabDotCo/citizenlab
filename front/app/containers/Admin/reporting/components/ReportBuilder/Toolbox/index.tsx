import React from 'react';

// components
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import SectionTitle from 'components/admin/ContentBuilder/Toolbox/SectionTitle';

// types
import { Locale } from 'typings';
import DraggableElement from '../../../../../../components/admin/ContentBuilder/Toolbox/DraggableElement';
import messages from '../../../../../../modules/commercial/content_builder/admin/messages';
import InfoWithAccordions from '../../../../../../modules/commercial/content_builder/admin/components/CraftSections/InfoWithAccordions';
import { FormattedMessage, useIntl } from '../../../../../../utils/cl-intl';
import TwoColumn from '../../../../../../components/admin/ContentBuilder/Widgets/TwoColumn';
import ThreeColumn from '../../../../../../components/admin/ContentBuilder/Widgets/ThreeColumn';
import WhiteSpace from '../../../../../../components/admin/ContentBuilder/Widgets/WhiteSpace';
import Text from '../../../../../../components/admin/ContentBuilder/Widgets/Text';
import textMessages from '../../../../../../components/admin/ContentBuilder/Widgets/Text/messages';
import Image from '../../../../../../components/admin/ContentBuilder/Widgets/Image';
import { useParams } from 'react-router-dom';
import AnalyticsChartWidget from '../Widgets/AnalyticsChartWidget';
import chartMessages from '../Widgets/AnalyticsChartWidget/messages';
import reportingMessages from '../../../messages';
import moment from 'moment';

type ContentBuilderToolboxProps = {
  selectedLocale: Locale;
};

const ContentBuilderToolbox = ({
  selectedLocale,
}: ContentBuilderToolboxProps) => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };
  console.log(selectedLocale); // Don't know why this is used?

  // Default end date for charts (today)
  const chartEndDate = moment().format('YYYY-MM-DDTHH:mm:ss.sss');

  return (
    <Container>
      <SectionTitle>Widgets</SectionTitle>

      <SectionTitle>
        <FormattedMessage {...messages.layout} />
      </SectionTitle>

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

      <SectionTitle>
        <FormattedMessage {...messages.content} />
      </SectionTitle>

      <DraggableElement
        id="e2e-draggable-report-header"
        component={<InfoWithAccordions projectId={projectId} />}
        icon="section-info-accordion"
        label={formatMessage(reportingMessages.reportHeader)}
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

      <SectionTitle>
        <FormattedMessage {...reportingMessages.chartsSection} />
      </SectionTitle>

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
    </Container>
  );
};

export default ContentBuilderToolbox;
