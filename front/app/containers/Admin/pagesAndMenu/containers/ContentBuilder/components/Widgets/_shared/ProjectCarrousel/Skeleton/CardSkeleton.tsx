import React from 'react';

import {
  stylingConsts,
  colors,
  Title,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

import { CardContainer } from '../../BaseCard';
import { CARD_WIDTH } from '../constants';

const ImageSkeleton = styled.div`
  width: 100%;
  display: flex;
  aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO};
  margin-right: 10px;
  overflow: hidden;
  position: relative;
  border-radius: ${stylingConsts.borderRadius};
  background-color: ${colors.grey300};
`;

interface Props {
  ml?: string;
  mr?: string;
}

const CardSkeleton = ({ ml, mr }: Props) => {
  return (
    <CardContainer w={`${CARD_WIDTH}px`} ml={ml} mr={mr}>
      <ImageSkeleton />
      <Title variant="h4" as="h3" mt="8px" mb="0px" color="tenantText">
        Lorem ipsum blabla
      </Title>
    </CardContainer>
  );
};

export default CardSkeleton;
