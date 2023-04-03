import GetMachineTranslation from 'modules/commercial/machine_translations/resources/GetMachineTranslation';
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { CommentText } from 'components/PostShowComponents/Comments/Comment/CommentBody';
import { Locale } from 'typings';

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
  if (translateButtonClicked) {
    return (
      <GetMachineTranslation
        attributeName="body_multiloc"
        localeTo={locale}
        id={commentId}
        context="comment"
      >
        {(translation) => {
          let text: string = commentContent;

          if (!isNilOrError(translation)) {
            text = translation.attributes.translation.replace(
              /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
              '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
            );
          }

          return <CommentText dangerouslySetInnerHTML={{ __html: text }} />;
        }}
      </GetMachineTranslation>
    );
  }

  return <CommentText dangerouslySetInnerHTML={{ __html: commentContent }} />;
};

export default PostShowTranslatedCommentBody;
