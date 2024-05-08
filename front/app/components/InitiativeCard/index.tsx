import React from 'react';

import {
  Box,
  Icon,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useInitiativeImage from 'api/initiative_images/useInitiativeImage';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useUserById from 'api/users/useUserById';

import useLocalize from 'hooks/useLocalize';

import Author from 'components/Author';
import FollowUnfollow from 'components/FollowUnfollow';
import Card from 'components/UI/Card';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import ReactionIndicator from './ReactionIndicator';

const FooterInner = styled.div`
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
  margin-bottom: 20px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const CommentIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
  margin-top: 2px;
`;

const CommentCount = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
`;

const CommentInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export interface Props {
  initiativeId: string;
  className?: string;
  showFollowButton?: boolean;
}

const InitiativeCard = ({
  className,
  initiativeId,
  showFollowButton,
}: Props) => {
  const localize = useLocalize();
  const { data: initiative } = useInitiativeById(initiativeId);
  const authorId = initiative?.data.relationships.author.data?.id;
  const { data: initiativeAuthor } = useUserById(authorId);
  const { data: initiativeImage } = useInitiativeImage(
    initiativeId,
    initiative?.data.relationships.initiative_images.data[0]?.id
  );

  if (!initiative) return null;

  const initiativeTitle = localize(initiative.data.attributes.title_multiloc);
  const initiativeAuthorId = initiativeAuthor ? initiativeAuthor.data.id : null;
  const initiativeImageUrl = initiativeImage?.data.attributes.versions.medium;
  const commentsCount = initiative.data.attributes.comments_count;
  const cardClassNames = [
    className,
    'e2e-initiative-card',
    commentsCount > 0 ? 'e2e-has-comments' : null,
  ]
    .filter((item) => typeof item === 'string' && item !== '')
    .join(' ');

  return (
    <Card
      className={cardClassNames}
      to={`/initiatives/${initiative.data.attributes.slug}?go_back=true`}
      scrollToTop
      imageUrl={initiativeImageUrl}
      title={initiativeTitle}
      body={
        <Box ml="-4px">
          <Author
            authorId={initiativeAuthorId}
            createdAt={initiative.data.attributes.proposed_at}
            size={34}
            anonymous={initiative.data.attributes.anonymous}
            showModeratorStyles={false}
          />
        </Box>
      }
      footer={
        <>
          <FooterInner>
            <ReactionIndicator initiativeId={initiativeId} />
            <Spacer />
            <CommentInfo>
              <CommentIcon name="comments" ariaHidden />
              <CommentCount
                aria-hidden
                className="e2e-initiativecard-comment-count"
              >
                {commentsCount}
              </CommentCount>
              <ScreenReaderOnly>
                <FormattedMessage
                  {...messages.xComments}
                  values={{ commentsCount }}
                />
              </ScreenReaderOnly>
            </CommentInfo>
          </FooterInner>
          {showFollowButton && (
            <Box p="8px" display="flex" justifyContent="flex-end" my="24px">
              <FollowUnfollow
                followableType="initiatives"
                followableId={initiative.data.id}
                followersCount={initiative.data.attributes.followers_count}
                followerId={
                  initiative.data.relationships.user_follower?.data?.id
                }
                w="100%"
                toolTipType="input"
              />
            </Box>
          )}
        </>
      }
    />
  );
};

export default InitiativeCard;
