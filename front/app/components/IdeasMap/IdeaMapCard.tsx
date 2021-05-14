import React, { memo, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// events
import { setIdeaMapCardSelected } from './events';
import {
  setLeafletMapHoveredMarker,
  leafletMapHoveredMarker$,
} from 'components/UI/LeafletMap/events';

// hooks
import useIdea from 'hooks/useIdea';

// i18n
import T from 'components/T';

// components
import { Icon } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { defaultCardStyle, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  padding: 20px;
  margin-bottom: 15px;
  background: #fff;
  ${defaultCardStyle};
  border: solid 1px #ccc;
  cursor: pointer;
  transition: all 100ms ease-out;

  &.hovered {
    border-color: #000;
    box-shadow: 0px 0px 0px 1px #000 inset;
  }
`;

const Title = styled.h3`
  height: 46px;
  color: ${(props) => props.theme.colorText};
  font-size: 18px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 23px;
  max-height: 46px;
  padding: 0;
  margin: 0;
  margin-bottom: 20px;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
`;

const FooterItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 25px;
`;

const DownvoteIcon = styled(Icon)`
  width: 17px;
  height: 17px;
  fill: ${colors.label};
  margin-right: 6px;
`;

const UpvoteIcon = styled(Icon)`
  width: 17px;
  height: 17px;
  fill: ${colors.label};
  margin-right: 6px;
  margin-top: 5px;
`;

const CommentIcon = styled(Icon)`
  width: 19px;
  height: 19px;
  fill: ${colors.label};
  margin-right: 6px;
`;

const FooterValue = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small + 1}px;
  line-height: normal;
  font-weight: 400;
`;

interface Props {
  ideaId: string;
  className?: string;
}

const IdeaMapCard = memo<Props>(({ ideaId, className }) => {
  const idea = useIdea({ ideaId });

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const subscriptions = [
      leafletMapHoveredMarker$.subscribe((hoverredIdeaId) => {
        setHovered(hoverredIdeaId === ideaId);
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, []);

  const handleOnClick = (event: React.FormEvent) => {
    event?.preventDefault();

    setIdeaMapCardSelected(ideaId);

    if (!isNilOrError(idea)) {
      // pan map to idea coordiantes
      // const lng = idea.attributes.location_point_geojson.coordinates[0];
      // const lat = idea.attributes.location_point_geojson.coordinates[1];
      // setLeafletMapCenter([lat, lng]);
    }
  };

  const handleOnMouseEnter = () => {
    setLeafletMapHoveredMarker(ideaId);
  };

  const handleOnMouseLeave = () => {
    setLeafletMapHoveredMarker(null);
  };

  if (!isNilOrError(idea)) {
    return (
      <Container
        className={`${className || ''} ${hovered ? 'hovered' : ''}`}
        onClick={handleOnClick}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
      >
        <Title>
          <T value={idea.attributes.title_multiloc} />
        </Title>
        <Footer>
          <FooterItem>
            <DownvoteIcon name="upvote" />
            <FooterValue>{idea.attributes.upvotes_count}</FooterValue>
          </FooterItem>
          <FooterItem>
            <UpvoteIcon name="downvote" />
            <FooterValue>{idea.attributes.downvotes_count}</FooterValue>
          </FooterItem>
          <FooterItem>
            <CommentIcon name="comments" />
            <FooterValue>{idea.attributes.comments_count}</FooterValue>
          </FooterItem>
        </Footer>
      </Container>
    );
  }

  return null;
});

export default IdeaMapCard;
