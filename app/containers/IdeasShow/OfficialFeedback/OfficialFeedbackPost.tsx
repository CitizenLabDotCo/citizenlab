import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import linkifyHtml from 'linkifyjs/html';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Locale, Multiloc } from 'typings';

// components
import OfficialFeedbackEdit from './Form/OfficialFeedbackEdit';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import T from 'components/T';

// styles
import { colors, fontSizes } from 'utils/styleUtils';
import { transparentize, darken } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { FormattedDate, InjectedIntlProps } from 'react-intl';
import { getLocalized } from 'utils/i18n';

// services
import { IOfficialFeedbackData, deleteOfficialfeedback } from 'services/officialFeedback';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';

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

  a {
    color: ${colors.clBlueDark};

    &.mention {
      background: ${transparentize(0.9, colors.clBlueDark)};
      padding-left: 4px;
      padding-right: 4px;

      &:hover {
        background: ${transparentize(0.8, colors.clBlueDark)};
      }
    }

    &:not(.mention){
      text-decoration: underline;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-all;
      word-break: break-word;
      hyphens: auto;

      &:hover {
        text-decoration: underline;
        color: ${darken(0.15, colors.clBlueDark)};
      }
    }

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
    }
  }
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

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
}

interface InputProps {
  editingAllowed: boolean | null;
  officialFeedbackPost: IOfficialFeedbackData;
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

  getPostBodyText = (postBodyMultiloc: Multiloc, locale: Locale, tenantLocales: Locale[]) => {
    const postBodyText = getLocalized(postBodyMultiloc, locale, tenantLocales);
    const processedPostBodyText = linkifyHtml(postBodyText.replace(
      /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
      '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
    ));
    return processedPostBodyText;
  }

  render() {
    const { editingAllowed, officialFeedbackPost, locale, tenantLocales } = this.props;
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
      return (
        <PostContainer key={officialFeedbackPost.id} className="e2e-official-feedback-post">
          {editingAllowed &&
            <StyledMoreActionsMenu ariaLabel={this.props.intl.formatMessage(messages.showMoreActions)} actions={this.getActions(officialFeedbackPost.id)} />
          }

          <>
            <Body>
              <div dangerouslySetInnerHTML={{ __html: this.getPostBodyText(body_multiloc, locale, tenantLocales) }} />
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

    return null;
  }
}

const OfficialFeedbackPostWithIntl = injectIntl<Props>(OfficialFeedbackPost);

const Data = adopt<DataProps, {}>({
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />
});

export default (inputProps: InputProps) => <Data>{dataProps => <OfficialFeedbackPostWithIntl {...inputProps} {...dataProps} />}</Data>;
