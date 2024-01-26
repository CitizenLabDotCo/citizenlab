import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import esriLogo from './esri-logo.png';

// intl
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import Tippy from '@tippyjs/react';

const Esri = () => {
  const isEsriEnabled = useFeatureFlag({ name: 'esri_integration' });
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
        background={colors.teal200}
        display="flex"
        justifyContent="center"
      >
        <Box
          background={colors.white}
          display="flex"
          p="10px"
          width="100%"
          borderRadius="5px"
          justifyContent="center"
          alignContent="center"
        >
          <Box my="auto">
            <img
              width="220px"
              height="80px"
              src={esriLogo}
              alt={formatMessage(messages.esriIntegrationImageAlt)}
            />
          </Box>
        </Box>
      </Box>
      <Box ml="32px" display="flex" flexDirection="column">
        <Text variant="bodyL" color="primary" my="0px">
          {formatMessage(messages.esriIntegration)}
        </Text>
        <Text color="coolGrey700">
          {formatMessage(messages.esriIntegrationDescription)}
        </Text>
        <Tippy
          content={<FormattedMessage {...messages.esriDisabled} />}
          disabled={isEsriEnabled}
          placement="top"
          theme="dark"
        >
          <div>
            <Button
              disabled={!isEsriEnabled}
              bgColor={colors.primary}
              height="45px"
              icon={isEsriEnabled ? 'arrow-right' : 'lock'}
              iconColor={colors.white}
              iconPos="right"
              width="fit-content"
              linkTo="/admin/tools/esri-integration"
              textColor="white"
            >
              {formatMessage(messages.esriIntegrationButton)}
            </Button>
          </div>
        </Tippy>
      </Box>
    </Box>
  );
};

export default Esri;
