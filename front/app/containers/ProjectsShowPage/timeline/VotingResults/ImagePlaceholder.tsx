import React from 'react';

import { Icon, IconNames, colors } from '@citizenlab/cl2-component-library';

import styled from 'styled-components';
import { transparentize } from 'polished';

const ImagePlaceholderContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${transparentize(0.94, colors.textSecondary)};
`;

const ImagePlaceholderIcon = styled(Icon)`
  width: 80px;
  height: 80px;
  fill: ${transparentize(0.62, colors.textSecondary)};
`;

interface Props {
  placeholderIconName: IconNames;
}

const ImagePlaceholder = ({ placeholderIconName }: Props) => (
  <ImagePlaceholderContainer>
    <ImagePlaceholderIcon name={placeholderIconName} />
  </ImagePlaceholderContainer>
);

export default ImagePlaceholder;
