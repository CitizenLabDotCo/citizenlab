import React from 'react';

// components
import Button from 'components/UI/Button';
import OfficialFeedbackPost from './OfficialFeedbackPost';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedDate } from 'react-intl';
import useIdeaOfficialFeedback from 'api/idea_official_feedback/useIdeaOfficialFeedback';
import useInitiativeOfficialFeedback from 'api/initiative_official_feedback/useInitiativeOfficialFeedback';

const Container = styled.div`
  &.hasTopMargin {
    margin-top: 60px;
  }
`;

const FeedbackHeader = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.phone`
    flex-direction: column;
    align-items: stretch;
    justify-content: left;
  `}
`;

const FeedbackTitle = styled.h2`
  color: ${colors.red600};
  font-size: ${fontSizes.l}px;
  line-height: normal;
  font-weight: 600;
  padding: 0;
  margin: 0;
`;

const FeedbackSubtitle = styled.div`
  color: ${colors.red600};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;

  ${isRtl`
    & span {
        display: flex;
        flex-direction: row-reverse;
    }
  `}
`;

const StyledOfficialFeedbackPost = styled(OfficialFeedbackPost)`
  margin-bottom: 15px;

  &:last {
    margin-bottom: 0;
  }
`;

const StyledSpan = styled.span`
  font-weight: 400;
`;

const LoadMoreButton = styled(Button)`
  margin-top: 10px;
`;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  editingAllowed: boolean | undefined;
  className?: string;
  a11y_pronounceLatestOfficialFeedbackPost?: boolean;
}

const OfficialFeedbackFeed = ({
  postId,
  postType,
  editingAllowed,
  className,
  a11y_pronounceLatestOfficialFeedbackPost,
}: Props) => {
  const [pageSize, setPageSize] = React.useState(3);
  const {
    data: ideaFeedbacks,
    fetchNextPage: fetchNextPageIdeasFeedback,
    hasNextPage: hasNextPageIdeasFeedback,
    isFetchingNextPage: isFetchingNextPageIdeasFeedback,
  } = useIdeaOfficialFeedback({
    ideaId: postId && postType === 'idea' ? postId : undefined,
    pageSize,
  });

  const {
    data: initiativeFeedbacks,
    fetchNextPage: fetchNextPageInitiativeFeedback,
    hasNextPage: hasNextPageInitiativesFeedback,
    isFetchingNextPage: isFetchingNextPageInitiativesFeedback,
  } = useInitiativeOfficialFeedback({
    initiativeId: postId && postType === 'initiative' ? postId : undefined,
    pageSize,
  });

  const officialFeedbacksList =
    postType === 'idea'
      ? ideaFeedbacks?.pages.flatMap((page) => page.data) || []
      : initiativeFeedbacks?.pages.flatMap((page) => page.data) || [];

  if (officialFeedbacksList.length > 0) {
    const updateDate =
      officialFeedbacksList[0].attributes.updated_at ||
      officialFeedbacksList[0].attributes.created_at;
    const formattedDate = (
      <FormattedDate
        value={updateDate}
        year="numeric"
        month="long"
        day="numeric"
      />
    );

    const onLoadMore = () => {
      if (postType === 'idea') {
        fetchNextPageIdeasFeedback();
      } else {
        fetchNextPageInitiativeFeedback();
      }
      setPageSize(10);
    };

    const hasMore =
      postType === 'idea'
        ? hasNextPageIdeasFeedback
        : hasNextPageInitiativesFeedback;

    return (
      <Container
        aria-live="polite"
        className={`${className} ${editingAllowed ? 'hasTopMargin' : ''}`}
        data-testid="official-feedback-feed"
      >
        <FeedbackHeader>
          <FeedbackTitle>
            <FormattedMessage {...messages.officialUpdates} />
          </FeedbackTitle>
          <FeedbackSubtitle>
            <FormattedMessage
              {...messages.lastUpdate}
              values={{
                lastUpdateDate: <StyledSpan>{formattedDate}</StyledSpan>,
              }}
            />
          </FeedbackSubtitle>
        </FeedbackHeader>

        {officialFeedbacksList.map((officialFeedbackPost, i) => {
          return (
            <StyledOfficialFeedbackPost
              key={officialFeedbackPost.id}
              editingAllowed={editingAllowed}
              officialFeedbackPost={officialFeedbackPost}
              postType={postType}
              a11y_pronounceLatestOfficialFeedbackPost={
                i === 0 && a11y_pronounceLatestOfficialFeedbackPost
              }
            />
          );
        })}

        {hasMore && (
          <LoadMoreButton
            buttonStyle="secondary-outlined"
            icon="refresh"
            onClick={onLoadMore}
            text={<FormattedMessage {...messages.showPreviousUpdates} />}
            processing={
              isFetchingNextPageIdeasFeedback ||
              isFetchingNextPageInitiativesFeedback
            }
          />
        )}
      </Container>
    );
  }
  return null;
};

export default OfficialFeedbackFeed;
