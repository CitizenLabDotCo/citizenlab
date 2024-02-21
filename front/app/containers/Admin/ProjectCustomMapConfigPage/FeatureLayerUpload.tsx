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

type Props = {
  projectId: string;
  setView: (view: ViewOptions) => void;
  mapConfigId: string;
};

const FeatureLayerUpload = ({ projectId, mapConfigId, setView }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();

  const [url, setUrl] = useState('');
  const [importError, setImportError] = useState(false);

  const tenantLocales = useAppConfigurationLocales();
  const { mutate: createProjectMapLayer } = useAddMapLayer();

  const addEsriFeatureLayer = () => {
    // First test if we have access to the Feature Layer URL
    const apiKey =
      appConfig?.data.attributes.settings.esri_integration?.api_key;
    const esriAuthManager = apiKey ? ApiKeyManager.fromKey(apiKey) : undefined;

    request(url, {
      authentication: esriAuthManager,
    })
      .then(() => {
        setImportError(false);

        // Add the new map layer
        if (mapConfigId && !isNilOrError(tenantLocales)) {
          createProjectMapLayer(
            {
              type: 'CustomMaps::EsriFeatureLayer',
              projectId,
              layer_url: url,
              id: mapConfigId,
              title_multiloc: { en: 'Testing', 'nl-BE': 'Testing nl-BE' }, // TODO
              default_enabled: true,
            },
            {
              onError: () => {
                setImportError(true);
              },
              onSuccess: () => {
                setView('main');
              },
            }
          );
        }
      })
      .catch((e) => {
        setImportError(true);

        switch (e.name) {
          case ErrorTypes.ArcGISRequestError:
            console.log('A general error from the API');
            break;

          case ErrorTypes.ArcGISAuthError:
            console.log('An authentication error');
            break;

          case ErrorTypes.ArcGISAccessDeniedError:
            console.log(
              'A user denying an authorization request in an oAuth workflow'
            );
            break;

          case ErrorTypes.ArcGISTokenRequestError:
            console.log(
              'An error response trying to generate a new access token'
            );
            break;

          default:
            console.log('Default error from Esri - usually a network error.');
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
          content={<p>TODO: Tooltip w image & link to support article</p>}
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
          'E.g. https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Congressional_Districts/FeatureServer/0'
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
        <Button onClick={addEsriFeatureLayer}>
          {formatMessage(messages.import2)}
        </Button>
      </Box>

      {importError && (
        <Error
          text={formatMessage(messages.importError)}
          marginTop="10px"
          showIcon={true}
        />
      )}
    </>
  );
};

export default FeatureLayerUpload;
