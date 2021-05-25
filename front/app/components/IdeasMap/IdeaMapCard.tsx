import React, { memo, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IOpenPostPageModalEvent } from 'containers/App';

// components
import Button from 'components/UI/Button';
import { Icon } from 'cl2-component-library';

// events
import eventEmitter from 'utils/eventEmitter';
import { setIdeaMapCardSelected } from './events';
import {
  setLeafletMapCenter,
  setLeafletMapHoveredMarker,
  leafletMapHoveredMarker$,
} from 'components/UI/LeafletMap/events';

// hooks
import useIdea from 'hooks/useIdea';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import T from 'components/T';

// styling
import styled from 'styled-components';
import {
  defaultCardStyle,
  fontSizes,
  colors,
  viewportWidths,
  media,
} from 'utils/styleUtils';

const Container = styled.button`
  padding: 20px;
  margin-bottom: 15px;
  background: #fff;
  ${defaultCardStyle};
  border: solid 1px #ccc;
  cursor: pointer;
  position: relative;
  transition: all 100ms ease-out;
  text-align: left;

  ${media.biggerThanMaxTablet`
    &:hover,
    &.hovered {
      border-color: #000;
      box-shadow: 0px 0px 0px 1px #000 inset;
    }
  `}

  ${media.smallerThanMaxTablet`
    width: 100%;
  `}
`;

const CloseButtonWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 8px;
  right: 8px;
`;

const CloseButton = styled(Button)``;

const Title = styled.h3`
  height: 46px;
  color: ${(props) => props.theme.colorText};
  font-size: 18px;
  font-weight: 600;
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

  ${media.smallerThanMaxTablet`
    width: calc(100% - 22px);
  `}
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
  onClose?: () => void;
  className?: string;
}

const IdeaMapCard = memo<Props>(({ ideaId, onClose, className }) => {
  const idea = useIdea({ ideaId });
  const { windowWidth } = useWindowSize();
  const smallerThanMaxTablet = windowWidth <= viewportWidths.largeTablet;

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

    if (smallerThanMaxTablet && !isNilOrError(idea)) {
      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: ideaId,
        slug: idea.attributes.slug,
        type: 'idea',
      });
    }

    if (!smallerThanMaxTablet && !isNilOrError(idea)) {
      const lng = idea.attributes.location_point_geojson.coordinates[0];
      const lat = idea.attributes.location_point_geojson.coordinates[1];
      setLeafletMapCenter([lat, lng]);
    }
  };

  const handleOnMouseEnter = () => {
    setLeafletMapHoveredMarker(ideaId);
  };

  const handleOnMouseLeave = () => {
    setLeafletMapHoveredMarker(null);
  };

  const handleCloseButtonClick = (event: React.FormEvent) => {
    event?.preventDefault();
    onClose?.();
  };

  if (!isNilOrError(idea)) {
    return (
      <Container
        className={`${className || ''} ${hovered ? 'hovered' : ''}`}
        onClick={handleOnClick}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        tabIndex={0}
      >
        {smallerThanMaxTablet && (
          <CloseButtonWrapper>
            <CloseButton
              width="22px"
              height="22px"
              padding="0px"
              buttonStyle="secondary"
              icon="close"
              iconSize="10px"
              borderRadius="3px"
              onClick={handleCloseButtonClick}
            />
          </CloseButtonWrapper>
        )}
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
