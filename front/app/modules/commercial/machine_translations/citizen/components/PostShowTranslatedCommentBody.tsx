import React from 'react';

import useComment from 'api/comments/useComment';

import useLocale from 'hooks/useLocale';

import { CommentText } from 'components/PostShowComponents/Comments/Comment/CommentBody';
import { formatCommentContent } from 'components/PostShowComponents/utils';

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
  const { data: comment } = useComment(commentId);

  const translation = useTranslation({
    context: 'comment',
    id: commentId,
    localeTo: locale,
    attributeName: 'body_multiloc',
    machineTranslationButtonClicked: translateButtonClicked || false,
    multiloc: comment?.data.attributes.body_multiloc,
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
