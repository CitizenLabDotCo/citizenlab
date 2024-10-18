import React from 'react';

import useTranslation from 'modules/commercial/machine_translations/hooks/useTranslation';

import useLocale from 'hooks/useLocale';

import { Title } from 'components/PostShowComponents/Title';

interface Props {
  postId: string;
  title: string;
  translateButtonClicked?: boolean;
  color?: string;
  align: 'left' | 'center';
}

const PostShowTranslatedTitle = ({
  translateButtonClicked,
  postId,
  color,
  align,
  title,
}: Props) => {
  const locale = useLocale();
  const translation = useTranslation({
    attributeName: 'title_multiloc',
    localeTo: locale,
    id: postId,
    context: 'idea',
    machineTranslationButtonClicked: translateButtonClicked || false,
  });
  const showTranslatedContent = translateButtonClicked && translation && locale;
  const content = showTranslatedContent
    ? translation.attributes.translation
    : title;

  return (
    <Title
      id={`e2e-idea-title`}
      color={color}
      align={align}
      aria-live={showTranslatedContent ? 'polite' : undefined}
    >
      {content}
    </Title>
  );
};

export default PostShowTranslatedTitle;
