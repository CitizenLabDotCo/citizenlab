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
import tooltipImage from './images/esri_portal_id_example.png';

// types
import { ViewOptions } from '.';

// utils
import { request, ErrorTypes, ApiKeyManager } from '@esri/arcgis-rest-request';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useUpdateMapConfig from 'api/map_config/useUpdateMapConfig';

type Props = {
  projectId: string;
  setView: (view: ViewOptions) => void;
  mapConfigId: string;
};

const WebMapUpload = ({ projectId, mapConfigId, setView }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const { mutateAsync: updateProjectMapConfig, isLoading: apiCallLoading } =
    useUpdateMapConfig();

  const [portalId, setPortalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [importError, setImportError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addEsriWebMap = () => {
    setLoading(true);
    // First test if we have access to the Web Map portal item
    const apiKey =
      appConfig?.data.attributes.settings.esri_integration?.api_key;
    const esriAuthManager = apiKey ? ApiKeyManager.fromKey(apiKey) : undefined;

    request(`https://www.arcgis.com/sharing/rest/content/items/${portalId}`, {
      authentication: esriAuthManager,
    })
      .then(() => {
        setImportError(false);
        if (mapConfigId) {
          // Save the web map ID to the map config
          updateProjectMapConfig(
            {
              projectId,
              id: mapConfigId,
              esri_web_map_id: portalId,
            },
            {
              onSuccess: () => {
                setSuccess(true);
                setLoading(false);
                setView('main');
              },
              onError: () => {
                setImportError(true);
                setErrorMessage(formatMessage(messages.defaultEsriError));
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
          {formatMessage(messages.addWebMap)}
        </Title>
        <IconTooltip
          mb="4px"
          content={
            <>
              <Box mb="8px">
                <img src={tooltipImage} alt="" width="100%" />
              </Box>
              {formatMessage(messages.webMapTooltip)}
            </>
          }
        />
      </Box>
      <Text my="8px" color={'grey800'}>
        {formatMessage(messages.addWebMapInstruction)}
      </Text>
      <Input
        type="text"
        value={portalId}
        onChange={(value) => {
          setPortalId(value);
        }}
        placeholder={'e1cc90bf48e74243883516c2f4f6f72d'}
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
          disabled={!portalId || portalId === ''}
          onClick={addEsriWebMap}
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

export default WebMapUpload;
