import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import esriLogo from './esri-logo.png';
import Tippy from '@tippyjs/react';

// intl
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

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
        borderRadius="3px"
      >
        <Box background={colors.white} display="flex" p="10px">
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
              icon={isEsriEnabled ? 'arrow-right' : 'lock'}
              iconPos="right"
              width="fit-content"
              linkTo="/admin/tools/esri-integration"
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
