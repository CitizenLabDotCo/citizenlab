import React, { useState } from 'react';

// components
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

import ShareReportModal from './ShareReportModal';

interface Props {
  reportId: string;
  buttonStyle?: 'primary' | 'secondary';
}

const ShareReportButton = ({ reportId, buttonStyle = 'secondary' }: Props) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const openShareModal = () => setShareModalOpen(true);
  const closeShareModal = () => setShareModalOpen(false);

  const reportPath = `/admin/reporting/report-builder/${reportId}`;

  return (
    <>
      <Button
        icon="share"
        buttonStyle={buttonStyle}
        bgColor={colors.primary}
        onClick={openShareModal}
        iconSize="18px"
      >
        <FormattedMessage {...messages.share} />
      </Button>
      <ShareReportModal
        open={shareModalOpen}
        onClose={closeShareModal}
        reportPath={reportPath}
      />
    </>
  );
};

export default ShareReportButton;
