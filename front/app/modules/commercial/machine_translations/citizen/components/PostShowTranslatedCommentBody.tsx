import React from 'react';

import useMachineTranslationByCommentId from 'modules/commercial/machine_translations/api/useMachineTranslationByCommentId';
import { SupportedLocale } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { CommentText } from 'components/PostShowComponents/Comments/Comment/CommentBody';

interface Props {
  translateButtonClicked: boolean;
  commentContent: string;
  locale: SupportedLocale;
  commentId: string;
}

const PostShowTranslatedCommentBody = ({
  translateButtonClicked,
  commentContent,
  locale,
  commentId,
}: Props) => {
  const isMachineTranslationsEnabled = useFeatureFlag({
    name: 'machine_translations',
  });
  const { data: translation } = useMachineTranslationByCommentId({
    commentId,
    machine_translation: {
      locale_to: locale,
      attribute_name: 'body_multiloc',
    },
    enabled: isMachineTranslationsEnabled,
  });
  const showTranslatedContent = translateButtonClicked && translation;
  const content = showTranslatedContent
    ? translation.data.attributes.translation.replace(
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
