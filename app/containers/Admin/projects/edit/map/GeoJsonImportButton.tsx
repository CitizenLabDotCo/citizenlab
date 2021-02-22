import React, { memo, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import * as gjv from 'geojson-validation';

// services
import { createProjectMapLayer } from 'services/mapLayers';

// components
import Error from 'components/UI/Error';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useMapConfig from 'hooks/useMapConfig';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';

// components
import Button from 'components/UI/Button';

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
  mapConfigId: string;
  className?: string;
}

const GeoJsonImportButton = memo<Props>(
  ({ projectId, mapConfigId, className }) => {
    const tenantLocales = useAppConfigurationLocales();
    const mapConfig = useMapConfig({ projectId });

    const [importError, setImportError] = useState(false);

    const handleGeoJsonImport = (event: any) => {
      const fileReader = new FileReader();
      fileReader.readAsText(event.target.files[0], 'UTF-8');
      event.target.value = null;
      fileReader.onload = (event: any) => {
        const geojson = JSON.parse(event.target.result);

        setImportError(false);

        if (gjv.valid(geojson)) {
          if (mapConfigId) {
            const unnamedLayersCount =
              mapConfig?.attributes?.layers?.filter((layer) =>
                layer?.title_multiloc?.['en']?.startsWith('Unnamed')
              )?.length || 0;

            const newUnnamedLayerTitle = `Unnamed layer ${
              unnamedLayersCount + 1
            }`;

            const title_multiloc = {
              en: newUnnamedLayerTitle,
            };

            if (!isNilOrError(tenantLocales)) {
              tenantLocales.forEach(
                (tenantLocale) =>
                  (title_multiloc[tenantLocale] = newUnnamedLayerTitle)
              );
            }

            createProjectMapLayer(projectId, {
              geojson,
              title_multiloc,
              id: mapConfigId,
              default_enabled: true,
            });
          }
        } else {
          setImportError(true);
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
          <StyledButton
            icon="upload-file"
            iconSize="19px"
            buttonStyle="secondary"
            padding="8px 12px"
          >
            <StyledLabel aria-hidden htmlFor="file-attachment-uploader" />
            <FormattedMessage {...messages.import} />
          </StyledButton>
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
