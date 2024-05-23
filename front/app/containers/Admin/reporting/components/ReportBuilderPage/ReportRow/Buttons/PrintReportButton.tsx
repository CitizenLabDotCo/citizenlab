import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useReport from 'api/reports/useReport';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  reportId: string;
}

const PrintReportButton = ({ reportId }: Props) => {
  const { data: report } = useReport(reportId);
  const printReportPath: RouteType = `/admin/reporting/report-builder/${reportId}/print`;

  if (!report) return null;

  const canEdit =
    report.data.attributes.action_descriptors.editing_report.enabled;

  return (
    <Button
      icon="blank-paper"
      buttonStyle="primary"
      bgColor={colors.primary}
      iconSize="18px"
      linkTo={printReportPath}
      disabled={!canEdit}
      openLinkInNewTab
    >
      <FormattedMessage {...messages.print} />
    </Button>
  );
};

export default PrintReportButton;
