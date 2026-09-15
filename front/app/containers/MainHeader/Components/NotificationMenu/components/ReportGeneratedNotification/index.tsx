import React, { memo } from 'react';

import { IReportGeneratedNotificationData } from 'api/notifications/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

type Props = {
  notification: IReportGeneratedNotificationData;
};

const ReportGeneratedNotification = memo<Props>(({ notification }) => (
  <NotificationWrapper
    to="/admin/reporting/report-builder/$reportId/editor"
    params={{ reportId: notification.attributes.report_id }}
    timing={notification.attributes.created_at}
    icon="stars"
    isRead={!!notification.attributes.read_at}
  >
    <FormattedMessage
      {...messages.reportGenerated}
      values={{
        projectTitle: (
          <T value={notification.attributes.project_title_multiloc} />
        ),
      }}
    />
  </NotificationWrapper>
));

export default ReportGeneratedNotification;
