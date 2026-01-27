import React from 'react';

import {
  Box,
  Text,
  Button,
  Icon,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const AiUpsellBanner = () => {
  const { formatMessage } = useIntl();

  return (
    <Box bgColor={colors.grey100} borderRadius="8px" p="20px" mb="16px">
      <Box display="flex" alignItems="flex-start" gap="12px">
        <Icon name="stars" width="24px" height="24px" />
        <Box>
          <Text m="0" mb="8px" fontWeight="semi-bold">
            {formatMessage(messages.unlockAiTopicClustering)}
          </Text>
          <Text m="0" mb="16px" fontSize="s">
            {formatMessage(messages.aiTopicClusteringDescription1)}
          </Text>
          <Tooltip
            content={<p>{formatMessage(messages.upsellTooltipMessage)}</p>}
            placement="top"
          >
            <Box display="inline-flex">
              <a
                href="mailto:support@govocal.com"
                style={{ textDecoration: 'none' }}
              >
                <Button
                  buttonStyle="primary-inverse"
                  size="s"
                  icon="arrow-right"
                  iconPos="right"
                >
                  {formatMessage(messages.upgradeYourPlan)}
                </Button>
              </a>
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default AiUpsellBanner;
