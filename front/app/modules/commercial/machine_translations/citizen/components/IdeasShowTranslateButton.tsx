import React from 'react';

import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import { IIdeaData } from 'api/ideas/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import TranslateButton from 'components/UI/TranslateButton';

const StyledTranslateButton = styled(TranslateButton)`
  margin-bottom: 20px;
`;

interface Props {
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
