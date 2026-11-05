import React from 'react';

import useTranslation from 'modules/commercial/machine_translations/hooks/useTranslation';

import useIdeaById from 'api/ideas/useIdeaById';

import useLocale from 'hooks/useLocale';

import { StyledH1 } from 'components/PostShowComponents/Title';

interface Props {
  postId: string;
  title: string;
  translateButtonClicked?: boolean;
  color?: string;
}

const PostShowTranslatedTitle = ({
  translateButtonClicked,
  postId,
  color,
  title,
}: Props) => {
  const locale = useLocale();
  const { data: idea } = useIdeaById(postId);
  const translation = useTranslation({
    attributeName: 'title_multiloc',
    localeTo: locale,
    id: postId,
    context: 'idea',
    machineTranslationButtonClicked: translateButtonClicked || false,
    multiloc: idea?.data.attributes.title_multiloc,
  });
  const showTranslatedContent = translateButtonClicked && translation && locale;
  const content = showTranslatedContent
    ? translation.attributes.translation
    : title;

  return (
    <StyledH1
      customColor={color}
      m="0"
      aria-live={showTranslatedContent ? 'polite' : undefined}
    >
      {content}
    </StyledH1>
  );
};

export default PostShowTranslatedTitle;
