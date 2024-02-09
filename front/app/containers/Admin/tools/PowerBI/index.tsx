import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// intl
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import Tippy from '@tippyjs/react';

import powerBIImage from './power-bi.png';

const PowerBI = () => {
  const isPowerBIEnabled = useFeatureFlag({ name: 'power_bi' });
  const { formatMessage } = useIntl();

  return (
    <Box
      background={colors.white}
      display="flex"
      p="20px"
      my="20px"
      width="100%"
    >
      <Box
        p="40px"
        w="320px"
        h="240px"
        background={colors.teal500}
        display="flex"
        justifyContent="center"
        borderRadius="3px"
      >
        <Box background={colors.white} display="flex" p="10px" width="100%">
          <img
            width="220px"
            height="140px"
            src={powerBIImage}
            alt={formatMessage(messages.powerBIImage)}
          />
        </Box>
      </Box>
      <Box ml="32px" display="flex" flexDirection="column">
        <Text variant="bodyL" color="primary" my="0px">
          {formatMessage(messages.powerBITitle)}
        </Text>
        <Text color="coolGrey700">
          {formatMessage(messages.powerBIDescription)}
        </Text>
        <Tippy
          content={<FormattedMessage {...messages.powerBIDisabled} />}
          disabled={isPowerBIEnabled}
          placement="top"
          theme="dark"
        >
          <div>
            <Button
              disabled={!isPowerBIEnabled}
              height="45px"
              icon={isPowerBIEnabled ? 'arrow-right' : 'lock'}
              iconColor={colors.white}
              iconPos="right"
              width="fit-content"
              linkTo="/admin/tools/power-bi"
              textColor="white"
              bgColor={colors.primary}
            >
              {formatMessage(messages.powerBIDownloadTemplates)}
            </Button>
          </div>
        </Tippy>
      </Box>
    </Box>
  );
};

export default PowerBI;
