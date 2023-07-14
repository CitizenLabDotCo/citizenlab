import React from 'react';

import TranslateButton from 'components/UI/TranslateButton';
import styled from 'styled-components';
import { IIdeaData } from 'api/ideas/types';
import { Locale } from 'typings';
import useFeatureFlag from 'hooks/useFeatureFlag';

const StyledTranslateButton = styled(TranslateButton)`
  margin-bottom: 20px;
`;

interface Props {
  translateButtonClicked: boolean;
  onClick: () => void;
  idea: IIdeaData;
  locale: Locale;
}

const IdeasShowTranslateButton = ({
  idea,
  locale,
  translateButtonClicked,
  onClick,
}: Props) => {
  const featureEnabled = useFeatureFlag({ name: 'machine_translations' });
  const showTranslateButton = !idea.attributes.title_multiloc[locale];

  if (!featureEnabled || !showTranslateButton) return null;

  return (
    <StyledTranslateButton
      translateButtonClicked={translateButtonClicked}
      onClick={onClick}
    />
  );
};

export default IdeasShowTranslateButton;
