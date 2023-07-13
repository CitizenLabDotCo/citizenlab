import React from 'react';
import { Locale } from 'typings';
import useMachineTranslationByCommentId from 'modules/commercial/machine_translations/api/useMachineTranslationByCommentId';

interface Props {
  translateButtonClicked: boolean;
  commentContent: string;
  locale: Locale;
  commentId: string;
}

const PostShowTranslatedCommentBody = ({
  translateButtonClicked,
  commentContent,
  locale,
  commentId,
}: Props) => {
  const { data: translation } = useMachineTranslationByCommentId({
    commentId,
    machine_translation: {
      locale_to: locale,
      attribute_name: 'body_multiloc',
    },
    enabled: true,
  });

  const content =
    translateButtonClicked && translation
      ? translation.data.attributes.translation.replace(
          /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
          '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
        )
      : commentContent;

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
};

export default PostShowTranslatedCommentBody;
