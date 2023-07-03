import React from 'react';

// hooks
import useLocale from 'hooks/useLocale';

// tracks
import tracks from '../tracks';
import { trackEventByName } from 'utils/analytics';

// components
import Outlet from 'components/Outlet';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IIdea } from 'api/ideas/types';

interface Props {
  idea: IIdea;
  translateButtonClicked: boolean;
  onClick: (clicked: boolean) => void;
}

const TranslateButton = ({ idea, translateButtonClicked, onClick }: Props) => {
  const locale = useLocale();
  if (isNilOrError(locale)) return null;

  const onTranslateIdea = () => {
    // analytics
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
