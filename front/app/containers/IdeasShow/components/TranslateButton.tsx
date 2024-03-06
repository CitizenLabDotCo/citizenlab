import React from 'react';

import { IIdea } from 'api/ideas/types';

import useLocale from 'hooks/useLocale';

import Outlet from 'components/Outlet';

import { trackEventByName } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';

import tracks from '../tracks';

interface Props {
  idea: IIdea;
  translateButtonClicked: boolean;
  onClick: (clicked: boolean) => void;
}

const TranslateButton = ({ idea, translateButtonClicked, onClick }: Props) => {
  const locale = useLocale();
  if (isNilOrError(locale)) return null;

  const onTranslateIdea = () => {
    if (translateButtonClicked) {
      trackEventByName(tracks.clickGoBackToOriginalIdeaCopyButton.name);
    } else {
      trackEventByName(tracks.clickTranslateIdeaButton.name);
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

export default TranslateButton;
