import { IPhaseData } from 'api/phases/types';
import { ReportResponse } from 'api/reports/types';

import { MessageDescriptor } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';

import messages from './messages';

const visibilityWarning = (
  report: ReportResponse,
  phase: IPhaseData
): MessageDescriptor => {
  const visible = report.data.attributes.visible;
  const started = pastPresentOrFuture(phase.attributes.start_at) !== 'future';

  if (!started) {
    return visible ? messages.visibleNotStarted : messages.notVisibleNotStarted;
  }

  return visible ? messages.visibleStarted : messages.notVisibleStarted;
};

export default visibilityWarning;
