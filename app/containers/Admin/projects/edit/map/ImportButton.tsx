import React, { memo } from 'react';
import * as gjv from 'geojson-validation';

// i18n
// import messages from '../messages';
// import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes, defaultOutline, isRtl } from 'utils/styleUtils';

// components
import { Icon } from 'cl2-component-library';
import Button from 'components/UI/Button';

const Container = styled.div`
  margin-bottom: 10px;
`;

const StyledIcon = styled(Icon)`
  width: 24px;
  height: 18px;
  fill: ${colors.label};
  margin-right: 10px;

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;
  `}
`;

const Input = styled.input`
  opacity: 0;
  position: absolute;
  pointer-events: none;
  width: 1px;
  height: 1px;

  &:focus + label {
    color: #000;
    border-color: #000;
    ${defaultOutline};

    ${StyledIcon} {
      fill: #000;
    }
  }
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

      if (gjv.valid(geojson)) {
        onChange(geojson);
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
        <StyledButton icon="download" buttonStyle="secondary">
          <StyledLabel aria-hidden htmlFor="file-attachment-uploader" />
          Import
        </StyledButton>
      </ButtonContainer>
    </Container>
  );
});

export default ImportButton;
