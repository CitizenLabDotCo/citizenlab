import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  IconTooltip,
  Input,
  Button,
  Success,
} from '@citizenlab/cl2-component-library';
import { request, ErrorTypes, ApiKeyManager } from '@esri/arcgis-rest-request';
import { useParams } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useUpdateMapConfig from 'api/map_config/useUpdateMapConfig';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import { ViewOptions } from '..';
import messages from '../messages';
import tooltipImage from '../TooltipImages/esri_portal_id_example.png';

type Props = {
  setView: (view: ViewOptions) => void;
  mapConfigId: string;
};

const WebMapUpload = ({ mapConfigId, setView }: Props) => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const { mutateAsync: updateMapConfig, isLoading: apiCallLoading } =
    useUpdateMapConfig(projectId);

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
          updateMapConfig(
            {
              mapConfigId,
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
        <Title my="4px" variant="h5" color={'coolGrey600'}>
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
        id="e2e-portal-id-input"
        type="text"
        value={portalId}
        onChange={(value) => {
          setPortalId(value);
        }}
        placeholder={'e1cc90bf48e74243883516c2f4f6f72d'}
      />

      <Box display="flex" flexWrap="wrap" gap="12px" mt="16px">
        <Button
          buttonStyle="secondary-outlined"
          onClick={() => {
            setView('main');
          }}
        >
          {formatMessage(messages.cancel2)}
        </Button>
        <Button
          data-cy="e2e-web-map-import-btn"
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
        <Error
          id="e2e-web-map-error"
          text={errorMessage}
          marginTop="10px"
          showIcon={true}
        />
      )}
    </>
  );
};

export default WebMapUpload;
