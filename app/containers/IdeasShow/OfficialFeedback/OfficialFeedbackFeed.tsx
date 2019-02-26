import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import OfficialFeedbackPost from './OfficialFeedbackPost';

// resources
import GetOfficialFeedback, { GetOfficialFeedbackChildProps } from 'resources/GetOfficialFeedback';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

const Container = styled.div`
  margin-bottom: 100px;
`;

const LoadMoreButton = styled(Button)`
`;

interface InputProps {
  ideaId: string;
  editingAllowed: boolean | null;
}

interface DataProps {
  officialFeedback: GetOfficialFeedbackChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class OfficialFeedbackFeed extends PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { officialFeedback, editingAllowed } = this.props;

    if (officialFeedback) {
      const { officialFeedbackList, querying, hasMore, loadingMore, onLoadMore } = officialFeedback;

      return (
        <Container>
          {!isNilOrError(officialFeedbackList) && officialFeedbackList.map(officialFeedbackPost => {
            return (
              <OfficialFeedbackPost
                key={officialFeedbackPost.id}
                editingAllowed={editingAllowed}
                officialFeedbackPost={officialFeedbackPost}
              />
            );
          })}

          {!querying && hasMore &&
            <LoadMoreButton
              onClick={onLoadMore}
              size="1"
              style="secondary-outlined"
              text={<FormattedMessage {...messages.loadPreviousUpdates} />}
              processing={loadingMore}
              height="50px"
              icon="showMore"
              iconPos="left"
              textColor={colors.clRed}
              fontWeight="500"
              borderColor="#ccc"
            />
          }
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  officialFeedback: ({ ideaId, render }) => <GetOfficialFeedback ideaId={ideaId}>{render}</GetOfficialFeedback>,
});

const OfficialFeedbackFeedWithIntl = injectIntl<Props>(OfficialFeedbackFeed);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedbackFeedWithIntl {...inputProps} {...dataProps} />}
  </Data>
);
