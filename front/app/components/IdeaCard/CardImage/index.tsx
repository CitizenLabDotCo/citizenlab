import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';

import Image from 'components/UI/Image';

import ImagePlaceholder from './ImagePlaceholder';

const IdeaCardImageWrapper = styled.div`
  flex: 0 0 162px;
  width: 162px;
  height: 162px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18px;
  overflow: hidden;
  border-radius: ${(props) => props.theme.borderRadius};

  ${media.tablet`
    width: 100%;
    margin-bottom: 18px;
  `}
`;

const IdeaCardImage = styled(Image)`
  width: 100%;
  height: 100%;
  flex: 1;
`;

interface Props {
  phase?: IPhaseData;
  image: string | null;
  hideImagePlaceholder: boolean;
}

const CardImage = ({ phase, image, hideImagePlaceholder }: Props) => {
  const participationMethod = phase?.attributes.participation_method;
  const votingMethod = phase?.attributes.voting_method;

  return (
    <>
      {image && (
        <IdeaCardImageWrapper>
          <IdeaCardImage src={image} cover={true} alt="" />
        </IdeaCardImageWrapper>
      )}

      {!image && !hideImagePlaceholder && (
        <IdeaCardImageWrapper>
          <ImagePlaceholder
            participationMethod={participationMethod}
            votingMethod={votingMethod}
          />
        </IdeaCardImageWrapper>
      )}
    </>
  );
};

export default CardImage;
