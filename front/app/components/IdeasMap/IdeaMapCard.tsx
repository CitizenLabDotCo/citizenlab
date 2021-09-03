import React, { memo, useEffect, useState } from 'react';
import { IOpenPostPageModalEvent } from 'containers/App';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import { Icon } from 'cl2-component-library';

// events
import eventEmitter from 'utils/eventEmitter';
import { setIdeaMapCardSelected } from './events';
import {
  setLeafletMapHoveredMarker,
  leafletMapHoveredMarker$,
} from 'components/UI/LeafletMap/events';

// hooks
import useWindowSize from 'hooks/useWindowSize';
import useAppConfiguration from 'hooks/useAppConfiguration';

// i18n
import T from 'components/T';
import FormattedBudget from 'utils/currency/FormattedBudget';

// styling
import styled from 'styled-components';
import {
  defaultCardStyle,
  fontSizes,
  colors,
  viewportWidths,
  media,
} from 'utils/styleUtils';

// typings
import { IIdeaMarkerData } from 'services/ideas';

const Container = styled.div`
  text-align: left;
  padding: 20px;
  margin: 0;
  margin-bottom: 15px;
  cursor: pointer;
  position: relative;
  ${defaultCardStyle}
  border: solid 1px #ccc;

  &:hover,
  &.hover {
    border-color: #000;
  }
`;

const CloseButtonWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 10px;
  right: 10px;
`;

const CloseButton = styled(Button)``;

const Title = styled.h3`
  height: 46px;
  max-height: 46px;
  color: ${(props) => props.theme.colorText};
  font-size: 18px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 23px;
  padding: 0;
  margin: 0;
  margin-bottom: 20px;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  /* ${media.smallerThanMaxTablet`
    width: calc(100% - 22px);
    margin-bottom: 25px;
  `} */
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

const MoneybagIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  fill: ${colors.label};
  margin-right: 6px;
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
  width: 20px;
  height: 20px;
  fill: ${colors.label};
  margin-right: 6px;
  margin-left: 2px;
`;

const FooterValue = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small + 1}px;
  line-height: normal;
  font-weight: 400;
`;

interface Props {
  ideaMarker: IIdeaMarkerData;
  isPBIdea: boolean;
  onClose?: () => void;
  className?: string;
}

const IdeaMapCard = memo<Props>(
  ({ ideaMarker, isPBIdea, onClose, className }) => {
    const tenant = useAppConfiguration();
    const { windowWidth } = useWindowSize();
    const smallerThanMaxTablet = windowWidth <= viewportWidths.largeTablet;

    const [hovered, setHovered] = useState(false);

    useEffect(() => {
      const subscriptions = [
        leafletMapHoveredMarker$.subscribe((hoverredIdeaId) => {
          if (!smallerThanMaxTablet) {
            setHovered(hoverredIdeaId === ideaMarker.id);
          }
        }),
      ];

      return () => {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [smallerThanMaxTablet]);

    const handleOnClick = (event: React.FormEvent) => {
      event?.preventDefault();

      setIdeaMapCardSelected(ideaMarker.id);

      if (smallerThanMaxTablet) {
        eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
          id: ideaMarker.id,
          slug: ideaMarker.attributes.slug,
          type: 'idea',
        });
      }
    };

    const handleOnKeyPress = (event: React.FormEvent) => {
      event?.preventDefault();

      if (event?.['key'] === 'Enter') {
        handleOnClick(event);
      }
    };

    const handleOnMouseEnter = () => {
      setLeafletMapHoveredMarker(ideaMarker.id);
    };

    const handleOnMouseLeave = () => {
      setLeafletMapHoveredMarker(null);
    };

    const handleCloseButtonClick = (event: React.FormEvent) => {
      event?.preventDefault();
      onClose?.();
    };

    if (!isNilOrError(tenant) && !isNilOrError(ideaMarker)) {
      const tenantCurrency = tenant.data.attributes.settings.core.currency;
      const ideaBudget = ideaMarker.attributes?.budget;

      return (
        <Container
          className={`${className || ''} ${hovered ? 'hover' : ''}`}
          onClick={handleOnClick}
          onKeyPress={handleOnKeyPress}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
          role="button"
          tabIndex={0}
        >
          {smallerThanMaxTablet && (
            <CloseButtonWrapper>
              <CloseButton
                width="26px"
                height="26px"
                padding="0px"
                buttonStyle="secondary"
                icon="close"
                iconSize="12px"
                onClick={handleCloseButtonClick}
              />
            </CloseButtonWrapper>
          )}
          <Title>
            <T value={ideaMarker.attributes.title_multiloc} />
          </Title>
          <Footer>
            {isPBIdea && tenantCurrency && ideaBudget && (
              <FooterItem>
                <MoneybagIcon name="coin-stack" />
                <FooterValue>
                  <FormattedBudget value={ideaBudget} />
                </FooterValue>
              </FooterItem>
            )}
            {!isPBIdea && (
              <>
                <FooterItem>
                  <DownvoteIcon name="upvote" />
                  <FooterValue>
                    {ideaMarker.attributes.upvotes_count}
                  </FooterValue>
                </FooterItem>
                <FooterItem>
                  <UpvoteIcon name="downvote" />
                  <FooterValue>
                    {ideaMarker.attributes.downvotes_count}
                  </FooterValue>
                </FooterItem>
              </>
            )}
            <FooterItem>
              <CommentIcon name="comments" />
              <FooterValue>{ideaMarker.attributes.comments_count}</FooterValue>
            </FooterItem>
          </Footer>
        </Container>
      );
    }

    return null;
  }
);

export default IdeaMapCard;
