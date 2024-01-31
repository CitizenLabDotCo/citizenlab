import React from 'react';

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
  const printReportPath = `/admin/reporting/report-builder/${reportId}/print`;

  return (
    <>
      <Button
        icon="blank-paper"
        buttonStyle="primary"
        bgColor={colors.primary}
        iconSize="18px"
        linkTo={printReportPath}
        openLinkInNewTab
      >
        <FormattedMessage {...messages.print} />
      </Button>
    </>
  );
};

export default PrintReportButton;
