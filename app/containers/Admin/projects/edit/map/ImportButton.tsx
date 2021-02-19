import React, { memo } from 'react';

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
  onChange: (geojson: GeoJSON.FeatureCollection) => void;
  className?: string;
}

const ImportButton = memo<Props>(({ onChange, className }) => {
  const handleGeoJsonImport = (event: any) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], 'UTF-8');
    event.target.value = null;
    fileReader.onload = (event: any) => {
      const geojson = JSON.parse(event.target.result);
      onChange(geojson);
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
    </Container>
  );
});

export default ImportButton;
