import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import T from 'components/T';

// resources
import GetAdminFeedback, { GetAdminFeedbackChildProps } from 'resources/GetAdminFeedback';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

const OfficialFeedbackPost = styled.div`
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
  ideaId: string;
}

interface DataProps {
  officialFeedback: GetAdminFeedbackChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class OfficialFeedbackFeed extends PureComponent<Props, State> {
  render() {
    if (this.props.officialFeedback) {
      const { adminFeedbackList, querying, hasMore, loadingMore, onLoadMore } = this.props.officialFeedback;

      return (
        <>
          {!isNilOrError(adminFeedbackList) && adminFeedbackList.map(adminFeedbackPost => {
            const bodyTextMultiloc = adminFeedbackPost.attributes.body_multiloc;
            const authorNameMultiloc = adminFeedbackPost.attributes.author_multiloc;

            return (
              <OfficialFeedbackPost key={adminFeedbackPost.id}>
                <EditPostButton
                  fullWidth={false}
                  style="text"
                  textColor={colors.text}
                  text={<FormattedMessage {...messages.editOfficialFeedbackPost} />}
                />
                <Body>
                  <T value={bodyTextMultiloc} supportHtml />
                </Body>
                <Footer>
                  <Author>
                    <T value={authorNameMultiloc} />
                  </Author>
                  <DatePosted>02 jan 2019</DatePosted>
                </Footer>
              </OfficialFeedbackPost>
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
        </>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  officialFeedback: ({ ideaId, render }) => <GetAdminFeedback ideaId={ideaId}>{render}</GetAdminFeedback>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedbackFeed {...inputProps} {...dataProps} />}
  </Data>
);
