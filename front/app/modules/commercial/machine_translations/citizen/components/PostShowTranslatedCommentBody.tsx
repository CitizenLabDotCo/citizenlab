import React from 'react';

import useLocale from 'hooks/useLocale';

import { CommentText } from 'components/PostShowComponents/Comments/Comment/CommentBody';

import useTranslation from '../../hooks/useTranslation';
import { formatCommentContent } from 'components/PostShowComponents/utils';

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
    ? formatCommentContent(translation.attributes.translation)
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
