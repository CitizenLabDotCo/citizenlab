import React from 'react';

// components
import { Icon } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { transparentize } from 'polished';
import { colors } from 'utils/styleUtils';

// typings
import {
  ParticipationMethod,
  VotingMethod,
} from 'services/participationContexts';

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
  participationMethod?: ParticipationMethod;
  votingMethod?: VotingMethod | null;
}

const ImagePlaceholder = ({ participationMethod, votingMethod }: Props) => (
  <ImagePlaceholderContainer>
    <ImagePlaceholderIcon
      name={
        participationMethod === 'voting' && votingMethod === 'budgeting'
          ? 'money-bag'
          : 'idea'
      }
    />
  </ImagePlaceholderContainer>
);

export default ImagePlaceholder;
