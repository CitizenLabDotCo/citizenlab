import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Button from 'components/UI/Button';
import OfficialFeedbackPost from './OfficialFeedbackPost';

// resources
import GetOfficialFeedbacks, { GetOfficialFeedbacksChildProps } from 'resources/GetOfficialFeedbacks';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

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
  color: ${colors.clRedError};
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
`;

const FeedbackTitle = styled.h4`
  margin-bottom: 0;
  font-weight: 500;
`;

const StyledSpan = styled.span`
  font-weight: 500;
`;

const LoadMoreButton = styled(Button)`
  margin-top: 10px;
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  permission: boolean | null;
  editingAllowed: boolean | null;
  className?: string;
}

interface DataProps {
  officialFeedbacks: GetOfficialFeedbacksChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class OfficialFeedbackFeed extends PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { officialFeedbacks, editingAllowed, permission, className } = this.props;

    if (officialFeedbacks) {
      const { officialFeedbacksList, querying, hasMore, loadingMore, onLoadMore } = officialFeedbacks;

      if (!isNilOrError(officialFeedbacksList) && officialFeedbacksList.data && officialFeedbacksList.data.length > 0) {
        const updateDate = (officialFeedbacksList.data[0].attributes.updated_at || officialFeedbacksList.data[0].attributes.created_at);
        const formattedDate = (
          <FormattedDate
            value={updateDate}
            year="numeric"
            month="long"
            day="numeric"
          />
        );

        return (
          <Container className={`${className} ${permission ? 'hasTopMargin' : ''}`}>
            <FeedbackHeader>
              <FeedbackTitle>
                <FormattedMessage {...messages.officialUpdates} />
              </FeedbackTitle>
                <FormattedMessage
                  {...messages.lastUpdate}
                  values={{ lastUpdateDate: (<StyledSpan>{formattedDate}</StyledSpan>) }}
                />
            </FeedbackHeader>

            {officialFeedbacksList.data.map((officialFeedbackPost, index) => {
              return (
                <OfficialFeedbackPost
                  key={officialFeedbackPost.id}
                  editingAllowed={editingAllowed}
                  officialFeedbackPost={officialFeedbackPost}
                  last={index === officialFeedbacksList.data.length - 1}
                />
              );
            })}

            {!querying && hasMore &&
              <LoadMoreButton
                onClick={onLoadMore}
                size="1"
                style="secondary-outlined"
                text={<FormattedMessage {...messages.showPreviousUpdates} />}
                processing={loadingMore}
                height="50px"
                icon="showMore"
                iconPos="left"
                textColor={colors.clRedError}
                fontWeight="500"
                borderColor="#ccc"
              />
            }
          </Container>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  officialFeedbacks: ({ postId, postType, render }) => <GetOfficialFeedbacks postId={postId} postType={postType}>{render}</GetOfficialFeedbacks>
});

const OfficialFeedbackFeedWithIntl = injectIntl<Props>(OfficialFeedbackFeed);

const WrappedOfficialFeedback = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedbackFeedWithIntl {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedOfficialFeedback;
