import React from 'react';

// components
import Card from 'components/UI/Card';
import { Box, Icon } from '@citizenlab/cl2-component-library';
import Author from 'components/Author';
import ReactionIndicator from './ReactionIndicator';
import FollowUnfollow from 'components/FollowUnfollow';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// hooks
import useUserById from 'api/users/useUserById';
import useInitiativeImage from 'api/initiative_images/useInitiativeImage';
import useLocalize from 'hooks/useLocalize';
import useInitiativeById from 'api/initiatives/useInitiativeById';

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

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
      imageUrl={initiativeImageUrl}
      title={initiativeTitle}
      body={
        <StyledAuthor
          authorId={initiativeAuthorId}
          createdAt={initiative.data.attributes.published_at}
          size={34}
          anonymous={initiative.data.attributes.anonymous}
        />
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
            <Box p="8px" display="flex" justifyContent="flex-end">
              <FollowUnfollow
                followableType="initiatives"
                followableId={initiative.data.id}
                followersCount={initiative.data.attributes.followers_count}
                followerId={
                  initiative.data.relationships.user_follower?.data?.id
                }
                py="2px"
              />
            </Box>
          )}
        </>
      }
    />
  );
};

export default InitiativeCard;
