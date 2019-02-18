import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

// components
import Button from 'components/UI/Button';
import T from 'components/T';

// resources
import GetAdminFeedback, { GetAdminFeedbackChildProps } from 'resources/GetAdminFeedback';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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

interface InputProps {
  feedSize: Number;
}

interface DataProps {
  adminFeedback: GetAdminFeedbackChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class AdminFeedbackFeed extends PureComponent<Props, State> {
  render() {
    if (this.props.adminFeedback) {
      const { querying, hasMore, loadingMore, onLoadMore } = this.props.adminFeedback;

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
              <p>
                Hi everyone! First off, thanks to those who filled out our survey from earlier this summer. User accounts is a big, big undertaking, and we’re still in the research phase, working to determine which use-cases would be most impactful to tackle first.
              </p>

              <p>
                Our first steps down this path will likely be in the realm of ecommerce, as we’re planning to build a login system for customers on your ecommerce site. The good news here is that nearly all of the work on this ecommerce customer portal will lay the foundation for larger work around a general user login/account system in Webflow.
              </p>

              <p>
                So, in summary: we’re still researching, but our planned work on ecommerce will continue moving us closer to the day when a more general user login/account system is possible in Webflow.
              </p>
            </Body>
            <Footer>
              <Author>Sarah from Mobility Department</Author>
              <DatePosted>02 jan 2019</DatePosted>
            </Footer>
          </AdminFeedbackPost>

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
        </>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  adminFeedback: <GetAdminFeedback />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminFeedbackFeed {...inputProps} {...dataProps} />}
  </Data>
);
