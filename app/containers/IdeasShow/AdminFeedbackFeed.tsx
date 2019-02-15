import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import T from 'components/T';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

import GetAdminFeedback, { GetAdminFeedbackChildProps } from 'resources/GetAdminFeedback';

interface InputProps {
  ideaId: string;
  pageSize: number;
}

interface DataProps {
  adminFeedback: GetAdminFeedbackChildProps;
}

interface Props extends InputProps, DataProps {}

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

class AdminFeedbackFeed extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  loadPreviousUpdates = () => {
    this.props.adminFeedback.onLoadMore();
  }

  render() {
    const { hasMore, loadingMore, adminFeedbackPosts } = this.props.adminFeedback;
    return (
      <>
        {!isNilOrError(adminFeedbackPosts) && adminFeedbackPosts.map(adminFeedbackPost => {
          const bodyTextMultiloc = adminFeedbackPost.attributes.body_multiloc;
          const authorNameMultiloc = adminFeedbackPost.attributes.author_multiloc;

          return (
            <AdminFeedbackPost key={adminFeedbackPost.id}>
              <EditPostButton
                fullWidth={false}
                style="text"
                textColor={colors.text}
                text={<FormattedMessage {...messages.editAdminFeedbackPost} />}
              />
              <Body>
                <T value={bodyTextMultiloc} />
              </Body>
              <Footer>
                <Author>
                  <T value={authorNameMultiloc} />
                </Author>
                <DatePosted>02 jan 2019</DatePosted>
              </Footer>
            </AdminFeedbackPost>
          );
        })}

        {hasMore &&
          <LoadMoreButton
            onClick={this.loadPreviousUpdates}
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
}

export default (inputProps: InputProps) => {
  return (
    <GetAdminFeedback pageSize={inputProps.pageSize} {...inputProps}>
      {adminFeedback => <AdminFeedbackFeed pageSize={inputProps.pageSize} ideaId={inputProps.ideaId} adminFeedback={adminFeedback} />}
    </GetAdminFeedback>
  );
};
