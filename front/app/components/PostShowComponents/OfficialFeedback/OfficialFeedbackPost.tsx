import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Locale, Multiloc } from 'typings';
import { IOfficialFeedbackData as IIdeaOfficialFeedbackData } from 'api/idea_official_feedback/types';
import { IOfficialFeedbackData as IInitiativeOfficialFeedbackData } from 'api/initiative_official_feedback/types';

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
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { FormattedDate } from 'react-intl';
import { getLocalized } from 'utils/i18n';

// resources
import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useDeleteIdeaOfficialFeedback from 'api/idea_official_feedback/useDeleteIdeaOfficialFeedback';
import useDeleteInitiativeOfficialFeedback from 'api/initiative_official_feedback/useDeleteInitiativeOfficialFeedback';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${(props) => props.theme.borderRadius};
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  padding: 30px;
  padding-top: 35px;
  margin-bottom: 15px;

  ${media.phone`
    padding: 20px;
    padding-top: 25px;
  `}
`;

const PostContainer = styled(Container)`
  white-space: pre-line;
  background: ${transparentize(0.94, colors.red600)};
  position: relative;
`;

const EditFormContainer = styled(Container)`
  background: ${colors.background};
`;

const Body = styled.div`
  margin-bottom: 30px;

  a {
    color: ${colors.teal700};

    &:hover {
      color: ${colors.teal700};
    }
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Author = styled.span`
  color: ${colors.textPrimary};
  font-size: ${fontSizes.base}px;
  font-weight: 600;

  ${isRtl`
    text-align: left;
  `}
`;

const DatesPostedEdited = styled.span`
  color: ${colors.textPrimary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  align-items: center;

  ${media.phone`
    flex-direction: column;
    align-items: flex-start;
  `}

  ${isRtl`
    justify-content: flex-end;
    ${media.phone`
        align-items: flex-end;
    `}
 `}
`;

const DatePosted = styled.span``;

const DatesSpacer = styled.span`
  margin-left: 4px;
  margin-right: 4px;

  ${media.phone`
    display: none;
  `}
`;

const DateEdited = styled.span`
  ${media.phone`
    font-style: italic;
  `}
`;

const StyledMoreActionsMenu = styled(MoreActionsMenu)`
  position: absolute;
  top: 12px;
  right: 15px;

  ${media.phone`
    top: 5px;
    right: 5px;
  `}

  ${isRtl`
    right: auto;
    left: 15px;

    ${media.phone`
        left: 5px;
    `}
`}
`;

interface Props {
  editingAllowed: boolean | undefined;
  officialFeedbackPost:
    | IIdeaOfficialFeedbackData
    | IInitiativeOfficialFeedbackData;
  postType: 'idea' | 'initiative';
  className?: string;
  a11y_pronounceLatestOfficialFeedbackPost?: boolean;
}

const OfficialFeedbackPost = ({
  officialFeedbackPost,
  editingAllowed,
  postType,
  className,
  a11y_pronounceLatestOfficialFeedbackPost,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { mutate: deleteOfficialFeedbackFromIdea } =
    useDeleteIdeaOfficialFeedback();
  const { mutate: deleteOfficialFeedbackFromInitiative } =
    useDeleteInitiativeOfficialFeedback();
  const tenantLocales = useAppConfigurationLocales();
  const [showEditForm, setShowEditForm] = useState(false);

  const openEditForm = () => {
    setShowEditForm(true);
  };

  const closeEditForm = () => {
    setShowEditForm(false);
  };

  const deletePost = (postId: string) => () => {
    if (window.confirm(formatMessage(messages.deletionConfirmation))) {
      switch (postType) {
        case 'idea':
          deleteOfficialFeedbackFromIdea(postId);
        // eslint-disable-next-line no-fallthrough
        case 'initiative':
          deleteOfficialFeedbackFromInitiative(postId);
      }
    }
  };

  const getActions = (postId: string): IAction[] => [
    {
      label: <FormattedMessage {...messages.editOfficialFeedbackPost} />,
      handler: openEditForm,
      name: 'edit',
    },
    {
      label: <FormattedMessage {...messages.deleteOfficialFeedbackPost} />,
      handler: deletePost(postId),
      name: 'delete',
    },
  ];

  const getPostBodyText = (
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

  const { body_multiloc, author_multiloc, created_at, updated_at } =
    officialFeedbackPost.attributes;

  if (showEditForm) {
    return (
      <EditFormContainer key={officialFeedbackPost.id}>
        <OfficialFeedbackForm
          formType="edit"
          feedback={officialFeedbackPost}
          onClose={closeEditForm}
          postType={postType}
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
            actions={getActions(officialFeedbackPost.id)}
          />
        )}

        <ScreenReaderOnly aria-live="polite">
          {a11y_pronounceLatestOfficialFeedbackPost &&
            getPostBodyText(body_multiloc, locale, tenantLocales)}
        </ScreenReaderOnly>

        <QuillEditedContent fontWeight={400}>
          <Body className="e2e-official-feedback-post-body">
            <div
              dangerouslySetInnerHTML={{
                __html: getPostBodyText(body_multiloc, locale, tenantLocales),
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
};

export default OfficialFeedbackPost;
