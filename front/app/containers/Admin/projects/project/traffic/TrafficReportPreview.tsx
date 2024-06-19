import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useLocale from 'hooks/useLocale';

import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import VisitorsTrafficSourcesWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/VisitorsTrafficSourcesWidget';
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const TrafficReportPreview = ({
  projectId,
  startAt,
  endAt,
}: {
  projectId: string;
  startAt?: string;
  endAt?: string;
}) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();

  return (
    <ReportContextProvider width="desktop">
      <Box maxWidth={MAX_REPORT_WIDTH} w="100%">
        <Editor isPreview={true}>
          <ContentBuilderFrame key={`${startAt} + ${endAt}`}>
            <WhiteSpace />
            <VisitorsTrafficSourcesWidget
              startAt={startAt}
              endAt={endAt}
              projectId={projectId}
              title={{ [locale]: formatMessage(messages.trafficSources) }}
            />
          </ContentBuilderFrame>
        </Editor>
      </Box>
    </ReportContextProvider>
  );
};

export default TrafficReportPreview;
