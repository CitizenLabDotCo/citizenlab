import React from 'react';

// components
import Button from 'components/UI/Button';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

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
  font-size: ${fontSizes.base}px;
  padding: 17px 53px 27px 34px;
  margin-bottom: 10px;
`;

const EditPostButton = styled(Button)`
  margin-left: auto;
  text-decoration: underline;
  padding: 0;
  margin-bottom: 10px;
`;

const Body = styled.div`
  line-height: 23px;
  margin-bottom: 16px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Author = styled.span`
  font-weight: 600;
`;

const DatePosted = styled.span`
  color: ${colors.label};
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
            Hi everyone! First off, thanks to those who filled out our survey from earlier this summer. User accounts is a big, big undertaking, and we’re still in the research phase, working to determine which use-cases would be most impactful to tackle first.

            Our first steps down this path will likely be in the realm of ecommerce, as we’re planning to build a login system for customers on your ecommerce site. The good news here is that nearly all of the work on this ecommerce customer portal will lay the foundation for larger work around a general user login/account system in Webflow.

            So, in summary: we’re still researching, but our planned work on ecommerce will continue moving us closer to the day when a more general user login/account system is possible in Webflow.
          </Body>
          <Footer>
            <Author>Sarah from Mobility Department</Author>
            <DatePosted>02 jan 2019</DatePosted>
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
