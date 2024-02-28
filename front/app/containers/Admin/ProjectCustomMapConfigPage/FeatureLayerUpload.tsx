import React, { useState } from 'react';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import Error from 'components/UI/Error';
import {
  Box,
  Title,
  Text,
  IconTooltip,
  Input,
  Button,
  Success,
} from '@citizenlab/cl2-component-library';

// types
import { ViewOptions } from '.';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { request, ErrorTypes, ApiKeyManager } from '@esri/arcgis-rest-request';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useAddMapLayer from 'api/map_layers/useAddMapLayer';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { getFeatureLayerInitialTitleMultiloc } from './utils';

type Props = {
  projectId: string;
  setView: (view: ViewOptions) => void;
  mapConfigId: string;
};

const FeatureLayerUpload = ({ projectId, mapConfigId, setView }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [importError, setImportError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const tenantLocales = useAppConfigurationLocales();
  const { mutate: createProjectMapLayer, isLoading: apiCallLoading } =
    useAddMapLayer();

  const addEsriFeatureLayer = () => {
    setLoading(true);

    // First test if we have access to the Feature Layer URL
    const apiKey =
      appConfig?.data.attributes.settings.esri_integration?.api_key;
    const esriAuthManager = apiKey ? ApiKeyManager.fromKey(apiKey) : undefined;

    request(url, {
      authentication: esriAuthManager,
    })
      .then((response) => {
        setImportError(false);

        const { serviceDescription, serviceItemId } = response;
        const subLayerCount = response.layers.length;

        // Add the new map layer
        if (mapConfigId && !isNilOrError(tenantLocales)) {
          createProjectMapLayer(
            {
              type: 'CustomMaps::EsriFeatureLayer',
              projectId,
              layer_url: url,
              id: mapConfigId,
              title_multiloc: getFeatureLayerInitialTitleMultiloc(
                serviceDescription || serviceItemId,
                tenantLocales,
                subLayerCount
              ),
              default_enabled: true,
            },
            {
              onError: () => {
                setImportError(true);
                setLoading(false);
              },
              onSuccess: () => {
                setLoading(false);
                setSuccess(true);
                setView('main');
              },
            }
          );
        }
      })
      .catch((e) => {
        setImportError(true);
        setLoading(false);

        switch (e.name) {
          case ErrorTypes.ArcGISRequestError:
            // A general error from the API
            setErrorMessage(formatMessage(messages.generalApiError));
            break;

          case ErrorTypes.ArcGISAuthError:
            // An authentication error
            setErrorMessage(formatMessage(messages.authenticationError));
            break;

          case ErrorTypes.ArcGISTokenRequestError:
            // An error response trying to generate a new access token
            setErrorMessage(formatMessage(messages.esriSideError));
            break;

          default:
            // Default error from Esri - usually a network error
            setErrorMessage(formatMessage(messages.defaultEsriError));
        }
      });
  };

  return (
    <>
      <Box mt="12px" display="flex" gap="8px" alignContent="center">
        <Title my="4px" variant="h5" color={'coolGrey600'} fontWeight="bold">
          {formatMessage(messages.addFeatureLayer)}
        </Title>
        <IconTooltip
          mb="4px"
          content={formatMessage(messages.featureLayerTooltop)}
        />
      </Box>
      <Text my="8px" color={'grey800'}>
        {formatMessage(messages.addFeatureLayerInstruction)}
      </Text>
      <Input
        type="text"
        value={url}
        onChange={(value) => {
          setUrl(value);
        }}
        placeholder={
          'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Congressional_Districts/FeatureServer/0'
        }
      />

      <Box display="flex" flexWrap="wrap" gap="12px" mt="16px">
        <Button
          buttonStyle="secondary"
          onClick={() => {
            setView('main');
          }}
        >
          {formatMessage(messages.cancel2)}
        </Button>
        <Button
          disabled={!url || url === ''}
          onClick={addEsriFeatureLayer}
          processing={apiCallLoading || loading}
        >
          {formatMessage(messages.import2)}
        </Button>
      </Box>
      {success && (
        <Success text={formatMessage(messages.layerAdded)} showIcon={true} />
      )}
      {importError && (
        <Error text={errorMessage} marginTop="10px" showIcon={true} />
      )}
    </>
  );
};

export default FeatureLayerUpload;
