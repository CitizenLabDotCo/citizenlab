import React, { memo, useRef, useState } from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';
import flatten from 'geojson-flatten';
import styled from 'styled-components';

import Banner from 'design-system/Banner';
import DSButton from 'design-system/Button';

import { IMapConfig } from 'api/map_config/types';
import useAddMapLayer from 'api/map_layers/useAddMapLayer';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import { getUnnamedLayerTitleMultiloc } from '../../../../utils/mapUtils/map';
import messages from '../messages';
import { getLayerType } from '../utils';

import styles from './DataImportOptions.module.css';

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

const StyledButton = styled(ButtonWithLink)`
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
  mapConfig: IMapConfig;
  className?: string;
  variant?: 'default' | 'panel';
}

const GeoJsonImportButton = memo<Props>(({ mapConfig, className, variant }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { projectId } = useParams({ strict: false }) as {
    projectId: string;
  };
  const { mutate: createProjectMapLayer } = useAddMapLayer(projectId);
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
      const rawGeojson = JSON.parse(event.target.result);

      setImportError(false);

      if (mapConfig.data.id && !isNilOrError(tenantLocales)) {
        try {
          setIsLoading(true);

          // Normalize the geojson
          const geojson = flatten(rawGeojson);

          createProjectMapLayer(
            {
              type: 'CustomMaps::GeojsonLayer',
              geojson,
              mapConfigId: mapConfig.data.id,
              title_multiloc: getUnnamedLayerTitleMultiloc(tenantLocales),
              default_enabled: true,
              id: mapConfig.data.id,
            },
            {
              onError: () => {
                setImportError(true);
              },
              onSettled: () => {
                setIsLoading(false);
              },
            }
          );
        } catch (e) {
          setIsLoading(false);
          setImportError(true);
        }
      }
    };
  };

  if (variant === 'panel') {
    return (
      <div className={`${styles.geoJsonOption} ${className ?? ''}`}>
        <input
          ref={fileInputRef}
          className={styles.fileInput}
          id="file-attachment-uploader"
          onChange={handleGeoJsonImport}
          type="file"
          accept={fileAccept.join(',')}
          tabIndex={-1}
          aria-hidden
        />
        <DSButton
          trailingIcon="upload-16"
          fullWidth
          onPress={() => fileInputRef.current?.click()}
          isDisabled={geoJsonImportDisabled}
          disabledReason={
            geoJsonImportDisabled
              ? formatMessage(messages.geojsonRemoveEsriTooltip)
              : undefined
          }
          isPending={isLoading}
        >
          <FormattedMessage {...messages.import} />
        </DSButton>
        {importError && (
          <div className={styles.importError}>
            <Banner tone="error">
              <FormattedMessage {...messages.importError} />
            </Banner>
          </div>
        )}
      </div>
    );
  }

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
        <Tooltip
          maxWidth="250px"
          placement="top"
          content={formatMessage(messages.geojsonRemoveEsriTooltip)}
          zIndex={9999999}
          hideOnClick={true}
          disabled={!geoJsonImportDisabled}
        >
          <div>
            <StyledButton
              icon="upload-file"
              buttonStyle="secondary-outlined"
              disabled={geoJsonImportDisabled}
              processing={isLoading}
            >
              <StyledLabel aria-hidden htmlFor="file-attachment-uploader" />
              <FormattedMessage {...messages.import} />
            </StyledButton>
          </div>
        </Tooltip>
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
});

export default GeoJsonImportButton;
