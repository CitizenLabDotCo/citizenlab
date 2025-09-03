import React from 'react';

import { SupportedLocale } from 'typings';

import { IIdea } from 'api/ideas/types';

import useLocale from 'hooks/useLocale';

import Outlet from 'components/Outlet';

import { trackEventByName } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';
import { getLanguage } from 'utils/i18n';

import tracks from '../tracks';

interface Props {
  idea: IIdea;
  translateButtonClicked: boolean;
  onClick: (clicked: boolean) => void;
}

const supportedLanguages = [
  'ar',
  'ca',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fi',
  'fr',
  'hr',
  'hu',
  'it',
  'lb',
  'lv',
  'mi',
  'nb',
  'nl',
  'pl',
  'pt',
  'ro',
  'sr',
  'sv',
  'tr',
];

const TranslateButton = ({ idea, translateButtonClicked, onClick }: Props) => {
  const locale = useLocale();
  if (isNilOrError(locale) || !supportsTranslation(locale)) return null;

  const onTranslateIdea = () => {
    if (translateButtonClicked) {
      trackEventByName(tracks.clickGoBackToOriginalIdeaCopyButton);
    } else {
      trackEventByName(tracks.clickTranslateIdeaButton);
    }
    onClick(!translateButtonClicked);
  };

  return (
    <Outlet
      id="app.containers.IdeasShow.left"
      idea={idea.data}
      locale={locale}
      onClick={onTranslateIdea}
      translateButtonClicked={translateButtonClicked}
    />
  );
};

function supportsTranslation(locale: SupportedLocale) {
  return supportedLanguages.includes(getLanguage(locale));
}

export default TranslateButton;
