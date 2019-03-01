import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import OfficialFeedbackPost from './OfficialFeedbackPost';

// resources
import { GetOfficialFeedbacksChildProps } from 'resources/GetOfficialFeedbacks';

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

interface Props {
  ideaId: string;
  editingAllowed: boolean | null;
  officialFeedbacks: GetOfficialFeedbacksChildProps;
}

interface State {}

class OfficialFeedbackFeed extends PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { officialFeedbacks, editingAllowed } = this.props;

    if (officialFeedbacks) {
      const { officialFeedbacksList, querying, hasMore, loadingMore, onLoadMore } = officialFeedbacks;

      return (
        <Container>
          {!isNilOrError(officialFeedbacksList) && officialFeedbacksList.data && officialFeedbacksList.data.map(officialFeedbackPost => {
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

export default injectIntl<Props>(OfficialFeedbackFeed);