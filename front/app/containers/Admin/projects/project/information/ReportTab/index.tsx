import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';

const ReportTab = () => {
  const phaseReportsEnabled = useFeatureFlag({ name: 'phase_reports' });
  const { formatMessage } = useIntl();

  if (!phaseReportsEnabled) return null;

  return (
    <Box>
      <Title variant="h3" color="primary">
        {formatMessage(messages.report)}
      </Title>
    </Box>
  );
};

export default ReportTab;
