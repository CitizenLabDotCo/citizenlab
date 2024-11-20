import React from 'react';

import useTranslation from 'modules/commercial/machine_translations/hooks/useTranslation';

import useLocale from 'hooks/useLocale';

import { isNilOrError } from 'utils/helperUtils';

interface Props {
  postId: string;
  body: string;
  translateButtonClicked?: boolean;
}

const PostShowTranslatedBody = ({
  translateButtonClicked,
  postId,
  body,
}: Props) => {
  const locale = useLocale();

  const translation = useTranslation({
    attributeName: 'body_multiloc',
    localeTo: locale,
    id: postId,
    context: 'idea',
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
