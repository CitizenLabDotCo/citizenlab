import React from 'react';

// api
import useIdeaImage from 'api/idea_images/useIdeaImage';

// components
import Image from 'components/UI/Image';
import ImagePlaceholder from './ImagePlaceholder';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { IIdea } from 'api/ideas/types';
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

const IdeaCardImageWrapper = styled.div<{ $cardInnerHeight: string }>`
  flex: 0 0 ${(props) => props.$cardInnerHeight};
  width: ${(props) => props.$cardInnerHeight};
  height: ${(props) => props.$cardInnerHeight};
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
  idea: IIdea;
  participationContext?: IProjectData | IPhaseData;
  hideImage: boolean;
  hideImagePlaceholder: boolean;
  innerHeight: string;
}

const CardImage = ({
  idea,
  participationContext,
  hideImage,
  hideImagePlaceholder,
  innerHeight,
}: Props) => {
  const { data: ideaImage } = useIdeaImage(
    idea.data.id,
    idea.data.relationships.idea_images.data?.[0]?.id
  );

  const image = ideaImage?.data.attributes.versions.medium;
  const showImage = !!image && !hideImage;

  const participationMethod =
    participationContext?.attributes.participation_method;

  const votingMethod = participationContext?.attributes.voting_method;

  return (
    <>
      {showImage && (
        <IdeaCardImageWrapper $cardInnerHeight={innerHeight}>
          <IdeaCardImage src={image} cover={true} alt="" />
        </IdeaCardImageWrapper>
      )}

      {!showImage && !hideImagePlaceholder && (
        <IdeaCardImageWrapper $cardInnerHeight={innerHeight}>
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
