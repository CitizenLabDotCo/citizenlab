import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Button from 'components/UI/Button';
import OfficialFeedbackPost from './OfficialFeedbackPost';

// resources
import GetOfficialFeedbacks, {
  GetOfficialFeedbacksChildProps,
} from 'resources/GetOfficialFeedbacks';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps, FormattedDate } from 'react-intl';

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

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    justify-content: left;
  `}
`;

const FeedbackTitle = styled.h2`
  color: ${colors.clRedError};
  font-size: ${fontSizes.large}px;
  line-height: normal;
  font-weight: 600;
  padding: 0;
  margin: 0;
`;

const FeedbackSubtitle = styled.div`
  color: ${colors.clRedError};
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

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  editingAllowed: boolean | undefined;
  className?: string;
  a11y_pronounceLatestOfficialFeedbackPost?: boolean;
}

interface DataProps {
  officialFeedbacks: GetOfficialFeedbacksChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class OfficialFeedbackFeed extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  render() {
    const {
      officialFeedbacks,
      editingAllowed,
      className,
      a11y_pronounceLatestOfficialFeedbackPost,
    } = this.props;

    if (officialFeedbacks) {
      const {
        officialFeedbacksList,
        querying,
        hasMore,
        loadingMore,
        onLoadMore,
      } = officialFeedbacks;

      if (
        !isNilOrError(officialFeedbacksList) &&
        officialFeedbacksList.data &&
        officialFeedbacksList.data.length > 0
      ) {
        const updateDate =
          officialFeedbacksList.data[0].attributes.updated_at ||
          officialFeedbacksList.data[0].attributes.created_at;
        const formattedDate = (
          <FormattedDate
            value={updateDate}
            year="numeric"
            month="long"
            day="numeric"
          />
        );

        return (
          <Container
            aria-live="polite"
            className={`${className} ${editingAllowed ? 'hasTopMargin' : ''}`}
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

            {officialFeedbacksList.data.map((officialFeedbackPost, i) => {
              return (
                <StyledOfficialFeedbackPost
                  key={officialFeedbackPost.id}
                  editingAllowed={editingAllowed}
                  officialFeedbackPost={officialFeedbackPost}
                  postType="initiative"
                  a11y_pronounceLatestOfficialFeedbackPost={
                    i === 0 && a11y_pronounceLatestOfficialFeedbackPost
                  }
                />
              );
            })}

            {!querying && hasMore && (
              <LoadMoreButton
                onClick={onLoadMore}
                text={<FormattedMessage {...messages.showPreviousUpdates} />}
                processing={loadingMore}
                icon="showMore"
                buttonStyle="secondary-outlined"
                padding="12px"
              />
            )}
          </Container>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  officialFeedbacks: ({ postId, postType, render }) => (
    <GetOfficialFeedbacks postId={postId} postType={postType}>
      {render}
    </GetOfficialFeedbacks>
  ),
});

const OfficialFeedbackFeedWithIntl = injectIntl<Props>(OfficialFeedbackFeed);

const WrappedOfficialFeedback = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <OfficialFeedbackFeedWithIntl {...inputProps} {...dataProps} />
    )}
  </Data>
);

export default WrappedOfficialFeedback;
