import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// components
import {
  Box,
  Title,
  Text,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';

const ReportTab = () => {
  const phaseReportsEnabled = useFeatureFlag({ name: 'phase_reports' });
  const { formatMessage } = useIntl();

  if (!phaseReportsEnabled) return null;

  return (
    <Box>
      <Title variant="h3" color="primary">
        {formatMessage(messages.report)}
      </Title>
      <Text color="textSecondary">
        {formatMessage(messages.createAReportTo)}
        <ul>
          <li>{formatMessage(messages.shareResults)}</li>
          <li>{formatMessage(messages.createAMoreComplex)}</li>
        </ul>
        {formatMessage(messages.thisWillBe)}
      </Text>
      <Box w="100%" mt="32px" display="flex">
        <Button icon="reports" bgColor={colors.primary} width="auto">
          {formatMessage(messages.createReport)}
        </Button>
      </Box>
    </Box>
  );
};

export default ReportTab;
