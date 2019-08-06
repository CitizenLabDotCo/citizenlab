import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Locale, Multiloc } from 'typings';

// components
import OfficialFeedbackEdit from './Form/OfficialFeedbackEdit';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// styles
import { colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { FormattedDate, InjectedIntlProps } from 'react-intl';
import { getLocalized } from 'utils/i18n';

// services
import { IOfficialFeedbackData, deleteOfficialFeedbackFromIdea, deleteOfficialFeedbackFromInitiative } from 'services/officialFeedback';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${(props: any) => props.theme.borderRadius};
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  padding: 30px;
  padding-top: 35px;
  margin-bottom: 10px;

  &.last {
    margin-bottom: 0;
  }
`;

const PostContainer = styled(Container)`
  white-space: pre-line;
  background: ${lighten(0.545, colors.clRedError)};
  background: rgba(236, 90, 36, 0.06);
  position: relative;
`;

const EditFormContainer = styled(Container)`
  background: ${colors.adminBackground};
`;

const Body = styled.div`
  margin-bottom: 30px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Author = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
`;

const DatePosted = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
`;

const DateEdited = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  font-style: italic;
`;

const StyledMoreActionsMenu = styled(MoreActionsMenu)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
}

interface InputProps {
  editingAllowed: boolean | null;
  officialFeedbackPost: IOfficialFeedbackData;
  last: boolean;
  postType: 'idea' | 'initiative';
}

interface Props extends InputProps, DataProps {}

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
    const { postType } = this.props;

    if (window.confirm(this.props.intl.formatMessage(messages.deletionConfirmation))) {
      switch (postType) {
        case 'idea':
          deleteOfficialFeedbackFromIdea(postId);
        case 'initiative':
          deleteOfficialFeedbackFromInitiative(postId);
        }
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
    }
  ] as IAction[]

  getPostBodyText = (postBodyMultiloc: Multiloc, locale: Locale, tenantLocales: Locale[]) => {
    const postBodyText = getLocalized(postBodyMultiloc, locale, tenantLocales);
    const processedPostBodyText = postBodyText.replace(
      /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
      '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
    );
    return processedPostBodyText;
  }

  render() {
    const { editingAllowed, officialFeedbackPost, locale, tenantLocales, last } = this.props;
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

    if (!isNilOrError(locale) && !isNilOrError(tenantLocales)) {
      const formattedDate = (
        <FormattedDate
          value={created_at}
          year="numeric"
          month="long"
          day="numeric"
        />
      );

      return (
        <PostContainer key={officialFeedbackPost.id} className={`e2e-official-feedback-post ${last ? 'last' : ''}`}>
          {editingAllowed &&
            <StyledMoreActionsMenu ariaLabel={this.props.intl.formatMessage(messages.showMoreActions)} actions={this.getActions(officialFeedbackPost.id)} />
          }

          <QuillEditedContent>
            <Body>
              <div dangerouslySetInnerHTML={{ __html: this.getPostBodyText(body_multiloc, locale, tenantLocales) }} />
            </Body>
            <Footer>
              <Author>
                <T value={author_multiloc} />
              </Author>

              <DatePosted>
                {formattedDate}
              </DatePosted>

              {updated_at && updated_at !== created_at && (
                <DateEdited>
                  <FormattedMessage
                    {...messages.lastEdition}
                    values={{ date: formattedDate }}
                  />
                </DateEdited>
              )
            }
            </Footer>
          </QuillEditedContent>
        </PostContainer>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, {}>({
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />
});

const OfficialFeedbackPostWithIntl = injectIntl<Props>(OfficialFeedbackPost);

export default (inputProps: InputProps) => (
  <Data>
    {dataProps => <OfficialFeedbackPostWithIntl {...inputProps} {...dataProps} />}
  </Data>
);
