import React from 'react';
import useTranslation from 'modules/machine_translations/hooks/useTranslation';
import { isNilOrError } from 'utils/helperUtils';

const PostShowComponentsBody = ({
  translateButtonClicked,
  locale,
  postId,
  postType,
  body,
}) => {
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
    <span
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
};

export default PostShowComponentsBody;
