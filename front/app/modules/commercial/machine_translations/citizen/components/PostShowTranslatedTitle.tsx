import React from 'react';

import useTranslation from 'modules/commercial/machine_translations/hooks/useTranslation';
import { CLLocale } from 'typings';

import { Title } from 'components/PostShowComponents/Title';

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  title: string;
  locale?: CLLocale;
  translateButtonClicked?: boolean;
  color?: string;
  align: 'left' | 'center';
}

const PostShowTranslatedTitle = ({
  locale,
  translateButtonClicked,
  postId,
  postType,
  color,
  align,
  title,
}: Props) => {
  const translation = useTranslation({
    attributeName: 'title_multiloc',
    localeTo: locale,
    id: postId,
    context: postType,
  });
  const showTranslatedContent = translateButtonClicked && translation && locale;
  const content = showTranslatedContent
    ? translation.attributes.translation
    : title;

  return (
    <Title
      id={`e2e-${postType}-title`}
      color={color}
      align={align}
      aria-live={showTranslatedContent ? 'polite' : undefined}
    >
      {content}
    </Title>
  );
};

export default PostShowTranslatedTitle;
