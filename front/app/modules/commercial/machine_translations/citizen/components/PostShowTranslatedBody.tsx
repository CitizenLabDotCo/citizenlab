import React from 'react';

import useTranslation from 'modules/commercial/machine_translations/hooks/useTranslation';

import useLocale from 'hooks/useLocale';

import { isNilOrError } from 'utils/helperUtils';

interface Props {
  postId: string;
  body: string;
  translateButtonClicked?: boolean;
  postType: 'idea' | 'initiative';
}

const PostShowTranslatedBody = ({
  translateButtonClicked,
  postId,
  postType,
  body,
}: Props) => {
  const locale = useLocale();

  const translation = useTranslation({
    attributeName: 'body_multiloc',
    localeTo: locale,
    id: postId,
    context: postType,
    machineTranslationButtonClicked: translateButtonClicked || false,
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
