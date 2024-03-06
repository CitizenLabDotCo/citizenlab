import React, { memo, useState } from 'react';

import Tippy from '@tippyjs/react';
import styled from 'styled-components';

import { IMapConfig } from 'api/map_config/types';
import useAddMapLayer from 'api/map_layers/useAddMapLayer';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import { getUnnamedLayerTitleMultiloc } from '../../../../utils/mapUtils/map';
import messages from '../messages';
import { getLayerType } from '../utils';

const Container = styled.div``;

const Input = styled.input`
  opacity: 0;
  position: absolute;
  pointer-events: none;
  width: 1px;
  height: 1px;
`;

const ButtonContainer = styled.div`
  display: flex;
`;

const StyledButton = styled(Button)`
  & button {
    position: relative;
  }
`;

const StyledLabel = styled.label`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  cursor: pointer;
`;

// accepted file extensions:
const fileAccept = [
  '.json',
  'application/json',
  '.geojson',
  'application/geojson',
];

interface Props {
  projectId: string;
  mapConfig: IMapConfig;
  className?: string;
}

const GeoJsonImportButton = memo<Props>(
  ({ projectId, mapConfig, className }) => {
    const { mutate: createProjectMapLayer } = useAddMapLayer();
    const { formatMessage } = useIntl();
    const tenantLocales = useAppConfigurationLocales();

    const [importError, setImportError] = useState(false);

    const layerType = getLayerType(mapConfig);
    const hasExistingWebMap = !!mapConfig.data.attributes.esri_web_map_id;

    const geoJsonImportDisabled =
      layerType === 'CustomMaps::EsriFeatureLayer' || hasExistingWebMap;

    const handleGeoJsonImport = (event: any) => {
      const fileReader = new FileReader();
      fileReader.readAsText(event.target.files[0], 'UTF-8');
      event.target.value = null;
      fileReader.onload = (event: any) => {
        const geojson = JSON.parse(event.target.result);

        setImportError(false);

        if (mapConfig.data.id && !isNilOrError(tenantLocales)) {
          createProjectMapLayer(
            {
              type: 'CustomMaps::GeojsonLayer',
              projectId,
              geojson,
              id: mapConfig.data.id,
              title_multiloc: getUnnamedLayerTitleMultiloc(tenantLocales),
              default_enabled: true,
            },
            {
              onError: () => {
                setImportError(true);
              },
            }
          );
        }
      };
    };

    return (
      <Container className={className || ''}>
        <Input
          id="file-attachment-uploader"
          onChange={handleGeoJsonImport}
          type="file"
          accept={fileAccept.join(',')}
          tabIndex={0}
        />

        <ButtonContainer>
          <Tippy
            maxWidth="250px"
            placement="top"
            content={formatMessage(messages.geojsonRemoveEsriTooltip)}
            hideOnClick={true}
            disabled={!geoJsonImportDisabled}
          >
            <div>
              <StyledButton
                icon="upload-file"
                buttonStyle="secondary"
                disabled={geoJsonImportDisabled}
              >
                <StyledLabel aria-hidden htmlFor="file-attachment-uploader" />
                <FormattedMessage {...messages.import} />
              </StyledButton>
            </div>
          </Tippy>
        </ButtonContainer>

        {importError && (
          <Error
            text={<FormattedMessage {...messages.importError} />}
            marginTop="10px"
            showIcon={true}
          />
        )}
      </Container>
    );
  }
);

export default GeoJsonImportButton;
