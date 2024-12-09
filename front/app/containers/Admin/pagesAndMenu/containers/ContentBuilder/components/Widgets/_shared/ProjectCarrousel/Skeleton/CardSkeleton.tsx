import React from 'react';

import {
  stylingConsts,
  colors,
  Shimmer,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

import { CardContainer } from '../../BaseCard';
import { CARD_WIDTH } from '../constants';

const ImageSkeleton = styled(Shimmer)`
  width: 100%;
  display: flex;
  aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO};
  margin-right: 10px;
  overflow: hidden;
  border-radius: ${stylingConsts.borderRadius};
`;

interface Props {
  ml?: string;
  mr?: string;
}

const CardSkeleton = ({ ml, mr }: Props) => {
  const theme = useTheme();

  return (
    <CardContainer w={`${CARD_WIDTH}px`} ml={ml} mr={mr}>
      <ImageSkeleton bgColor={colors.grey300} />
      <Shimmer
        bgColor={theme.colors.tenantText}
        width="180px"
        borderRadius="16px"
        height="24px"
        mt="8px"
      />
      <Shimmer
        bgColor={theme.colors.tenantText}
        width="100px"
        borderRadius="16px"
        height="24px"
        mt="8px"
      />
      <Shimmer
        bgColor={colors.grey600}
        width="120px"
        borderRadius="16px"
        height="24px"
        mt="8px"
      />
    </CardContainer>
  );
};

export default CardSkeleton;
