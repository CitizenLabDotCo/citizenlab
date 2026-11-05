import React from 'react';

import useTranslation from 'modules/commercial/machine_translations/hooks/useTranslation';

import useIdeaById from 'api/ideas/useIdeaById';

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
  const { data: idea } = useIdeaById(postId);

  const translation = useTranslation({
    attributeName: 'body_multiloc',
    localeTo: locale,
    id: postId,
    context: 'idea',
    machineTranslationButtonClicked: translateButtonClicked || false,
    multiloc: idea?.data.attributes.body_multiloc,
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
