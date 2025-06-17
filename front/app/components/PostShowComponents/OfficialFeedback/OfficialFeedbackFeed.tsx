import React from 'react';

import {
  colors,
  fontSizes,
  media,
  isRtl,
  Title,
} from '@citizenlab/cl2-component-library';
import { FormattedDate } from 'react-intl';
import styled from 'styled-components';

import useIdeaOfficialFeedback from 'api/idea_official_feedback/useIdeaOfficialFeedback';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import OfficialFeedbackPost from './OfficialFeedbackPost';

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

const LoadMoreButton = styled(ButtonWithLink)`
  margin-top: 10px;
`;

interface Props {
  postId: string;
  editingAllowed: boolean | undefined;
  className?: string;
  a11y_pronounceLatestOfficialFeedbackPost?: boolean;
}

const OfficialFeedbackFeed = ({
  postId,
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
    ideaId: postId ? postId : undefined,
    pageSize,
  });

  const officialFeedbacksList =
    ideaFeedbacks?.pages.flatMap((page) => page.data) || [];

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
      fetchNextPageIdeasFeedback();

      setPageSize(10);
    };

    const hasMore = hasNextPageIdeasFeedback;

    return (
      <Container
        aria-live="polite"
        className={`${className} ${editingAllowed ? 'hasTopMargin' : ''}`}
        id="official-feedback-feed"
      >
        <FeedbackHeader>
          <Title variant="h2" m="0" color="red600" fontSize="l">
            <FormattedMessage {...messages.officialUpdates} />
          </Title>
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
            processing={isFetchingNextPageIdeasFeedback}
          />
        )}
      </Container>
    );
  }
  return null;
};

export default OfficialFeedbackFeed;
