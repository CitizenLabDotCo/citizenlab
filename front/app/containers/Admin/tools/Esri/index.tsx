import React from 'react';

import { Box, Text, colors, Tooltip } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import esriLogo from './esri-logo.png';

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
        <Tooltip
          content={<FormattedMessage {...messages.esriDisabled} />}
          disabled={isEsriEnabled}
          placement="top"
          theme="dark"
        >
          <div>
            <ButtonWithLink
              disabled={!isEsriEnabled}
              bgColor={colors.primary}
              icon={isEsriEnabled ? 'arrow-right' : 'lock'}
              iconPos="right"
              width="fit-content"
              linkTo="/admin/tools/esri-integration"
            >
              {formatMessage(messages.esriIntegrationButton)}
            </ButtonWithLink>
          </div>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Esri;
