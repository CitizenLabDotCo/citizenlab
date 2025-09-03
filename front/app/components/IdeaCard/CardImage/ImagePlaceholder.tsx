import React from 'react';

import { Icon, colors } from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';
import styled from 'styled-components';

import { VotingMethod } from 'api/phases/types';

const ImagePlaceholderContainer = styled.div`
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
  votingMethod?: VotingMethod | null;
}

const ImagePlaceholder = ({ votingMethod }: Props) => (
  <ImagePlaceholderContainer>
    <ImagePlaceholderIcon
      name={votingMethod === 'budgeting' ? 'money-bag' : 'idea'}
    />
  </ImagePlaceholderContainer>
);

export default ImagePlaceholder;
