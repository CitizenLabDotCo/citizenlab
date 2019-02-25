import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import T from 'components/T';
import OfficialFeedbackEdit from './Form/OfficialFeedbackEdit';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

// resources
import GetOfficialFeedback, { GetOfficialFeedbackChildProps } from 'resources/GetOfficialFeedback';
import { deleteOfficialfeedback } from 'services/officialFeedback';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps, FormattedDate } from 'react-intl';

const Container = styled.div`
  margin-bottom: 100px;
`;

const OfficialFeedbackPost = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(236, 90, 36, 0.06);
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  padding: 17px 34px 27px 34px;
  margin-bottom: 10px;
`;

const StyledMoreActionsMenu = styled(MoreActionsMenu)`
  margin-left: auto;
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
  showForm: (postId: string) => void;
  editingAllowed: boolean | null;
  editingPost: string;
}

interface DataProps {
  officialFeedback: GetOfficialFeedbackChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class OfficialFeedbackFeed extends PureComponent<Props & InjectedIntlProps, State> {

  changeForm = (postId: string) => () => {
    this.props.showForm(postId);
  }

  deletePost = (postId: string) => () => {
    if (window.confirm(this.props.intl.formatMessage(messages.deletionConfirmation))) {
      deleteOfficialfeedback(postId);
    }
  }

  getActions = (postId: string) => [
    {
      label: <FormattedMessage {...messages.editOfficialFeedbackPost} />,
      handler: this.changeForm(postId),
    },
    {
      label: <FormattedMessage {...messages.deleteOfficialFeedbackPost} />,
      handler: this.deletePost(postId),
    }] as IAction[]

  render() {
    const { officialFeedback, editingAllowed, editingPost } = this.props;

    if (officialFeedback) {
      const { officialFeedbackList, querying, hasMore, loadingMore, onLoadMore } = officialFeedback;

      return (
        <Container>
          {!isNilOrError(officialFeedbackList) && officialFeedbackList.map(officialFeedbackPost => {
            const bodyTextMultiloc = officialFeedbackPost.attributes.body_multiloc;
            const authorNameMultiloc = officialFeedbackPost.attributes.author_multiloc;

            return (
              <OfficialFeedbackPost key={officialFeedbackPost.id}>
                {editingAllowed &&
                  <StyledMoreActionsMenu actions={this.getActions(officialFeedbackPost.id)} />
                }
                {editingAllowed && editingPost === officialFeedbackPost.id ? (
                    <OfficialFeedbackEdit
                      feedback={officialFeedbackPost}
                      closeForm={this.changeForm('new')}
                    />
                  ) : (
                    <>
                      <Body>
                        <T value={bodyTextMultiloc} supportHtml />
                      </Body>
                      <Footer>
                        <Author>
                          <T value={authorNameMultiloc} />
                        </Author>
                        <DatePosted><FormattedDate value={officialFeedbackPost.attributes.created_at} /></DatePosted>
                      </Footer>
                    </>
                  )
                }
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

const WrappedOfficialFeedBack = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedbackFeedWithIntl {...inputProps} {...dataProps} />}
  </Data>
);

Object.assign(WrappedOfficialFeedBack).displayName = 'WrappedOfficialFeedBack';

export default WrappedOfficialFeedBack;
