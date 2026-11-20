import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SupportedLocale } from 'typings';

import { IIdeaData } from 'api/ideas/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import TranslationNotice from './TranslationNotice';

interface Props {
  // True when the translation is shown. This is the default.
  translateButtonClicked: boolean;
  onClick: () => void;
  idea: IIdeaData;
  locale: SupportedLocale;
}

const IdeasShowTranslateButton = ({
  idea,
  locale,
  translateButtonClicked,
  onClick,
}: Props) => {
  const featureEnabled = useFeatureFlag({ name: 'machine_translations' });
  const titleMultiloc = idea.attributes.title_multiloc;
  const needsTranslation = !titleMultiloc[locale];

  if (!featureEnabled || !needsTranslation) return null;

  return (
    <Box mb="20px">
      <TranslationNotice
        multiloc={titleMultiloc}
        showTranslation={translateButtonClicked}
        onToggle={onClick}
      />
    </Box>
  );
};

export default IdeasShowTranslateButton;
