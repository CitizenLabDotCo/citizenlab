import React, { PureComponent } from 'react';
import styled from 'styled-components';

// components
import OfficialFeedbackEdit from './Form/OfficialFeedbackEdit';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import T from 'components/T';

// styles
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { FormattedDate, InjectedIntlProps } from 'react-intl';

// services
import { IOfficialFeedbackData, deleteOfficialfeedback } from 'services/officialFeedback';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 3px;
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  padding: 17px 34px 27px 34px;
  margin-bottom: 10px;
`;

const PostContainer = Container.extend`
  background-color: rgba(236, 90, 36, 0.06);
`;

const EditFormContainer = Container.extend`
  background-color: ${colors.adminBackground};
`;

const Body = styled.div`
  line-height: 23px;
  margin-bottom: 16px;
  white-space: pre-line;
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

const DateEdited = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-style: italic;
  margin-top: 10px;
`;

const StyledMoreActionsMenu = styled(MoreActionsMenu)`
  align-self: flex-end;
  margin-bottom: 10px;
`;

interface Props {
  editingAllowed: boolean | null;
  officialFeedbackPost: IOfficialFeedbackData;
}

interface State {
  showEditForm: boolean;
}

export class OfficialFeedbackPost extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      showEditForm: false
    };
  }

  showEditForm = () => {
    this.setState({ showEditForm: true });
  }

  closeEditForm = () => {
    this.setState({ showEditForm: false });
  }

  deletePost = (postId: string) => () => {
    if (window.confirm(this.props.intl.formatMessage(messages.deletionConfirmation))) {
      deleteOfficialfeedback(postId);
    }
  }

  getActions = (postId: string) => [
    {
      label: <FormattedMessage {...messages.editOfficialFeedbackPost} />,
      handler: this.showEditForm,
      name: 'edit'
    },
    {
      label: <FormattedMessage {...messages.deleteOfficialFeedbackPost} />,
      handler: this.deletePost(postId),
      name: 'delete'
    }] as IAction[]

  render() {
    const { editingAllowed, officialFeedbackPost } = this.props;
    const { showEditForm } = this.state;
    const { body_multiloc, author_multiloc, created_at, updated_at } = officialFeedbackPost.attributes;

    if (showEditForm) {
      return (
        <EditFormContainer key={officialFeedbackPost.id}>
          <OfficialFeedbackEdit
            feedback={officialFeedbackPost}
            closeForm={this.closeEditForm}
          />
        </EditFormContainer>
      );
    }
    console.log(body_multiloc);

    return (
      <PostContainer key={officialFeedbackPost.id} className="e2e-official-feedback-post">
        {editingAllowed &&
          <StyledMoreActionsMenu ariaLabel={this.props.intl.formatMessage(messages.showMoreActions)} actions={this.getActions(officialFeedbackPost.id)} />
        }

        <>
          <Body>
            <T value={body_multiloc} supportHtml />
          </Body>
          <Footer>
            <Author>
              <T value={author_multiloc} />
            </Author>
            <DatePosted><FormattedDate value={created_at} /></DatePosted>
            {updated_at && updated_at !== created_at && (
              <DateEdited>
                <FormattedMessage
                  {...messages.lastEdition}
                  values={{ date: <FormattedDate value={updated_at} /> }}
                />
              </DateEdited>
            )
          }
          </Footer>
        </>
      </PostContainer>
    );
  }
}

const OfficialFeedbackPostWithIntl = injectIntl<Props>(OfficialFeedbackPost);

export default OfficialFeedbackPostWithIntl;
