import useTranslation from 'modules/commercial/machine_translations/hooks/useTranslation';
import React from 'react';
import { Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  postId: string;
  body: string;
  locale: Locale;
  translateButtonClicked?: boolean;
  postType: 'idea' | 'initiative';
}

const PostShowTranslatedBody = ({
  translateButtonClicked,
  locale,
  postId,
  postType,
  body,
}: Props) => {
  const translation = useTranslation({
    attributeName: 'body_multiloc',
    localeTo: locale,
    id: postId,
    context: postType,
  });

  const content =
    translateButtonClicked && !isNilOrError(translation)
      ? translation.attributes.translation
      : body;

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
};

export default PostShowTranslatedBody;
