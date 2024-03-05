import React from 'react';

// api
import useReport from 'api/reports/useReport';

// components
import Button from 'components/UI/Button';
import Tippy from '@tippyjs/react';

// styling
import {
  TooltipContentWrapper,
  colors,
} from '@citizenlab/cl2-component-library';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { CONTENT_BUILDER_Z_INDEX } from 'components/admin/ContentBuilder/FullscreenContentBuilder';

interface Props {
  reportId: string;
  disabledTooltipText?: string;
}

const PrintReportButton = ({ reportId, disabledTooltipText }: Props) => {
  const { data: report } = useReport(reportId);
  const printReportPath = `/admin/reporting/report-builder/${reportId}/print`;

  if (!report) return null;

  const canEdit =
    report.data.attributes.action_descriptor.editing_report.enabled;

  return (
    <Tippy
      interactive={false}
      placement="bottom"
      disabled={!disabledTooltipText}
      zIndex={CONTENT_BUILDER_Z_INDEX + 1}
      content={
        <TooltipContentWrapper tippytheme="light">
          {disabledTooltipText}
        </TooltipContentWrapper>
      }
    >
      <div>
        <Button
          icon="blank-paper"
          buttonStyle="primary"
          bgColor={colors.primary}
          iconSize="18px"
          linkTo={printReportPath}
          disabled={!canEdit || !!disabledTooltipText}
          openLinkInNewTab
        >
          <FormattedMessage {...messages.print} />
        </Button>
      </div>
    </Tippy>
  );
};

export default PrintReportButton;
