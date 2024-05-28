import React from 'react';

import useLocale from 'hooks/useLocale';

import { CommentText } from 'components/PostShowComponents/Comments/Comment/CommentBody';

import useTranslation from '../../hooks/useTranslation';

interface Props {
  translateButtonClicked: boolean;
  commentContent: string;
  commentId: string;
}

const PostShowTranslatedCommentBody = ({
  translateButtonClicked,
  commentContent,
  commentId,
}: Props) => {
  const locale = useLocale();

  const translation = useTranslation({
    context: 'comment',
    id: commentId,
    localeTo: locale,
    attributeName: 'body_multiloc',
    machineTranslationButtonClicked: translateButtonClicked || false,
  });
  const showTranslatedContent = translateButtonClicked && translation;
  const content = showTranslatedContent
    ? translation.attributes.translation.replace(
        /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
        '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
      )
    : commentContent;

  return (
    <CommentText
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
};

export default PostShowTranslatedCommentBody;
