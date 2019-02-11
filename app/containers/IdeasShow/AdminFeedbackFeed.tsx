import React from 'react';

// components
import Button from 'components/UI/Button';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  feedSize: Number;
}

interface State {}

const AdminFeedbackPost = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(236, 90, 36, 0.06);
  color: ${colors.text};
`;

const EditPostButton = styled(Button)`
  margin-left: auto;
  text-decoration: underline;
`;

const Body = styled.div``;

const Footer = styled.div``;

const Author = styled.span`
  font-weight: bold;
`;

const DatePosted = styled.span`
`;

const LoadMoreButton = styled(Button)`
`;

export default class AdminFeedbackFeed extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  loadPreviousUpdates = () => {

  }

  render() {
    return (
      <>
        <AdminFeedbackPost>
          <EditPostButton
            fullWidth={false}
            style="text"
            textColor={colors.text}
            text={<FormattedMessage {...messages.editAdminFeedbackPost} />}
          />
          <Body>
            {}
          </Body>
          <Footer>
            <Author>{}</Author>
            <DatePosted>{}</DatePosted>
          </Footer>
        </AdminFeedbackPost>
        {true /* !querying && hasMore && */ &&
            <LoadMoreButton
              onClick={this.loadPreviousUpdates}
              size="1"
              style="secondary-outlined"
              text={<FormattedMessage {...messages.loadPreviousUpdates} />}
              processing={false} /* change this */
              height="50px"
              icon="showMore"
              iconPos="left"
              textColor={colors.clRed}
              fontWeight="500"
              borderColor="#ccc"
            />
        }
      </>
    );
  }
}
