import React from 'react';
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
  background-color: rgba(236, 90, 36, 0.06);
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  padding: 17px 34px 27px 34px;
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

const StyledMoreActionsMenu = styled(MoreActionsMenu)`
  align-self: flex-end;
  margin-bottom: 10px;
`;

interface Props {
  editingAllowed: boolean | null;
  editingPost: string;
  officialFeedbackPost: IOfficialFeedbackData;
  showForm: (postId: string) => void;
}

const OfficialFeedbackPost = (props: Props & InjectedIntlProps) => {
  const { editingAllowed, editingPost, officialFeedbackPost, showForm } = props;
  const { formatMessage } = props.intl;

  const changeForm = (postId: string) => () => {
    showForm(postId);
  };

  const deletePost = (postId: string) => () => {
    if (window.confirm(formatMessage(messages.deletionConfirmation))) {
      deleteOfficialfeedback(postId);
    }
  };

  const getActions = (postId: string) => [
    {
      label: <FormattedMessage {...messages.editOfficialFeedbackPost} />,
      handler: changeForm(postId),
      name: 'edit'
    },
    {
      label: <FormattedMessage {...messages.deleteOfficialFeedbackPost} />,
      handler: deletePost(postId),
      name: 'delete'
    }] as IAction[];

  const bodyTextMultiloc = officialFeedbackPost.attributes.body_multiloc;
  const authorNameMultiloc = officialFeedbackPost.attributes.author_multiloc;

  return (
    <Container className="e2e-official-feedback-post">
      {editingAllowed &&
        <StyledMoreActionsMenu actions={getActions(officialFeedbackPost.id)} />
      }
      {editingAllowed && editingPost === officialFeedbackPost.id ? (
          <OfficialFeedbackEdit
            feedback={officialFeedbackPost}
            closeForm={changeForm('new')}
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
    </Container>
  );
};

const OfficialFeedbackPostWithIntl = injectIntl<Props>(OfficialFeedbackPost);

export default OfficialFeedbackPostWithIntl;
