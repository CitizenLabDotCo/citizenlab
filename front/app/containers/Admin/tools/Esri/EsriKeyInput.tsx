import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  Input,
  Button,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

import useFeatureFlag from 'hooks/useFeatureFlag';

import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

const EsriKeyInput = () => {
  const { data: appConfig } = useAppConfiguration();
  const isEsriIntegrationEnabled = useFeatureFlag({ name: 'esri_integration' });
  const [apiKey, setApiKey] = useState(
    appConfig?.data.attributes.settings.esri_integration?.api_key || ''
  );
  const { formatMessage } = useIntl();
  const {
    mutate: updateAppConfiguration,
    isLoading,
    error,
    isSuccess,
  } = useUpdateAppConfiguration();

  const saveApiKey = () => {
    updateAppConfiguration({
      settings: {
        esri_integration: {
          api_key: apiKey,
        },
      },
    });
  };

  return (
    <>
      {isEsriIntegrationEnabled && (
        <>
          <Box w="100%">
            <GoBackButton onClick={clHistory.goBack} />
          </Box>
          <Title color="primary" variant="h1" mb="0" fontWeight="semi-bold">
            {formatMessage(messages.esriMaps)}
          </Title>
          <Text color="coolGrey600">
            {formatMessage(messages.esriKeyInputDescription)}
          </Text>
          <Box background={colors.white} p="36px">
            <Box width="400px">
              <Input
                type="text"
                onChange={(value) => {
                  setApiKey(value);
                }}
                value={apiKey}
                placeholder={formatMessage(messages.esriKeyInputPlaceholder)}
                label={formatMessage(messages.esriKeyInputLabel)}
              />
            </Box>

            <Button
              bgColor={colors.primary}
              processing={isLoading}
              mt="32px"
              width="fit-content"
              text={formatMessage(messages.esriSaveButtonText)}
              onClick={() => {
                saveApiKey();
              }}
            />
            {isSuccess && (
              <Text color="success" mb="0px">
                {formatMessage(messages.esriSaveButtonSuccess)}
              </Text>
            )}
            {error && (
              <Text color="error">
                {formatMessage(messages.esriSaveButtonError)}
              </Text>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default EsriKeyInput;
