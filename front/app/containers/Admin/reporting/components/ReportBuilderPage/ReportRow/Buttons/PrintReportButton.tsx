import React from 'react';

// api
import useReport from 'api/reports/useReport';

// components
import Button from 'components/UI/Button';

// styling
import { colors } from '@citizenlab/cl2-component-library';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  reportId: string;
}

const PrintReportButton = ({ reportId }: Props) => {
  const { data: report } = useReport(reportId);
  const printReportPath = `/admin/reporting/report-builder/${reportId}/print`;

  if (!report) return null;

  const canEdit =
    report.data.attributes.action_descriptor.editing_report.enabled;

  return (
    <>
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
    </>
  );
};

export default PrintReportButton;
