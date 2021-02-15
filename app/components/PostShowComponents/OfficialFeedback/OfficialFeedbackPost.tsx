import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Locale, Multiloc } from 'typings';

// components
import OfficialFeedbackForm from './OfficialFeedbackForm';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// styles
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import styled from 'styled-components';
import { transparentize } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { FormattedDate, InjectedIntlProps } from 'react-intl';
import { getLocalized } from 'utils/i18n';

// services
import {
  IOfficialFeedbackData,
  deleteOfficialFeedbackFromIdea,
  deleteOfficialFeedbackFromInitiative,
} from 'services/officialFeedback';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${(props: any) => props.theme.borderRadius};
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  padding: 30px;
  padding-top: 35px;
  margin-bottom: 15px;

  ${media.smallerThanMinTablet`
    padding: 20px;
    padding-top: 25px;
  `}
`;

const PostContainer = styled(Container)`
  white-space: pre-line;
  background: ${transparentize(0.94, colors.clRedError)};
  position: relative;
`;

const EditFormContainer = styled(Container)`
  background: ${colors.background};
`;

const Body = styled.div`
  margin-bottom: 30px;

  a {
    color: ${colors.clBlueDarker};

    &:hover {
      color: ${colors.clBlueDarker};
    }
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Author = styled.span`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: 600;

  ${isRtl`
    text-align: left;
  `}
`;

const DatesPostedEdited = styled.span`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  align-items: center;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: flex-start;
  `}

  ${isRtl`
    justify-content: flex-end;
    ${media.smallerThanMinTablet`
        align-items: flex-end;
    `}
 `}
`;

const DatePosted = styled.span``;

const DatesSpacer = styled.span`
  margin-left: 4px;
  margin-right: 4px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const DateEdited = styled.span`
  ${media.smallerThanMinTablet`
    font-style: italic;
  `}
`;

const StyledMoreActionsMenu = styled(MoreActionsMenu)`
  position: absolute;
  top: 12px;
  right: 15px;

  ${media.smallerThanMinTablet`
    top: 5px;
    right: 5px;
  `}

  ${isRtl`
    right: auto;
    left: 15px;

    ${media.smallerThanMinTablet`
        left: 5px;
    `}
`}
`;

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
}

interface InputProps {
  editingAllowed: boolean | undefined;
  officialFeedbackPost: IOfficialFeedbackData;
  postType: 'idea' | 'initiative';
  className?: string;
  a11y_pronounceLatestOfficialFeedbackPost?: boolean;
}

interface Props extends InputProps, DataProps {}

interface State {
  showEditForm: boolean;
}

export class OfficialFeedbackPost extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      showEditForm: false,
    };
  }

  showEditForm = () => {
    this.setState({ showEditForm: true });
  };

  closeEditForm = () => {
    this.setState({ showEditForm: false });
  };

  deletePost = (postId: string) => () => {
    const { postType } = this.props;

    if (
      window.confirm(
        this.props.intl.formatMessage(messages.deletionConfirmation)
      )
    ) {
      switch (postType) {
        case 'idea':
          deleteOfficialFeedbackFromIdea(postId);
        case 'initiative':
          deleteOfficialFeedbackFromInitiative(postId);
      }
    }
  };

  getActions = (postId: string) =>
    [
      {
        label: <FormattedMessage {...messages.editOfficialFeedbackPost} />,
        handler: this.showEditForm,
        name: 'edit',
      },
      {
        label: <FormattedMessage {...messages.deleteOfficialFeedbackPost} />,
        handler: this.deletePost(postId),
        name: 'delete',
      },
    ] as IAction[];

  getPostBodyText = (
    postBodyMultiloc: Multiloc,
    locale: Locale,
    tenantLocales: Locale[]
  ) => {
    const postBodyText = getLocalized(postBodyMultiloc, locale, tenantLocales);
    const processedPostBodyText = postBodyText.replace(
      /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
      '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
    );
    return processedPostBodyText;
  };

  render() {
    const {
      editingAllowed,
      officialFeedbackPost,
      locale,
      tenantLocales,
      className,
      a11y_pronounceLatestOfficialFeedbackPost,
    } = this.props;
    const { showEditForm } = this.state;
    const {
      body_multiloc,
      author_multiloc,
      created_at,
      updated_at,
    } = officialFeedbackPost.attributes;

    if (showEditForm && !isNilOrError(locale) && !isNilOrError(tenantLocales)) {
      return (
        <EditFormContainer key={officialFeedbackPost.id}>
          <OfficialFeedbackForm
            locale={locale}
            tenantLocales={tenantLocales}
            formType="edit"
            feedback={officialFeedbackPost}
            onClose={this.closeEditForm}
          />
        </EditFormContainer>
      );
    }

    if (!isNilOrError(locale) && !isNilOrError(tenantLocales)) {
      const formattedPostedOnDate = (
        <FormattedDate
          value={created_at}
          year="numeric"
          month="long"
          day="numeric"
        />
      );

      const formattedUpdatedAtDate = (
        <FormattedDate
          value={updated_at}
          year="numeric"
          month="long"
          day="numeric"
        />
      );

      return (
        <PostContainer
          key={officialFeedbackPost.id}
          className={`e2e-official-feedback-post ${className || ''}`}
        >
          {editingAllowed && (
            <StyledMoreActionsMenu
              ariaLabel={this.props.intl.formatMessage(
                messages.showMoreActions
              )}
              actions={this.getActions(officialFeedbackPost.id)}
            />
          )}

          <ScreenReaderOnly aria-live="polite">
            {a11y_pronounceLatestOfficialFeedbackPost &&
              this.getPostBodyText(body_multiloc, locale, tenantLocales)}
          </ScreenReaderOnly>

          <QuillEditedContent fontWeight={400}>
            <Body className="e2e-official-feedback-post-body">
              <div
                dangerouslySetInnerHTML={{
                  __html: this.getPostBodyText(
                    body_multiloc,
                    locale,
                    tenantLocales
                  ),
                }}
              />
            </Body>
            <Footer>
              <Author className="e2e-official-feedback-post-author">
                <T value={author_multiloc} />
              </Author>

              <DatesPostedEdited>
                <DatePosted>
                  <FormattedMessage
                    {...messages.postedOn}
                    values={{ date: formattedPostedOnDate }}
                  />
                </DatePosted>
                {updated_at && updated_at !== created_at && (
                  <>
                    <DatesSpacer>-</DatesSpacer>
                    <DateEdited>
                      <FormattedMessage
                        {...messages.lastEdition}
                        values={{ date: formattedUpdatedAtDate }}
                      />
                    </DateEdited>
                  </>
                )}
              </DatesPostedEdited>
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
  tenantLocales: <GetAppConfigurationLocales />,
});

const OfficialFeedbackPostWithIntl = injectIntl<Props>(OfficialFeedbackPost);

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps) => (
      <OfficialFeedbackPostWithIntl {...inputProps} {...dataProps} />
    )}
  </Data>
);
