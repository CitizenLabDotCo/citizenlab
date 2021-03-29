import React from 'react';

import FeatureFlag from 'components/FeatureFlag';
import TranslateButton from 'components/UI/TranslateButton';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { GetIdeaChildProps } from 'resources/GetIdea';
import { GetLocaleChildProps } from 'resources/GetLocale';

const StyledTranslateButton = styled(TranslateButton)`
  margin-bottom: 20px;
`;

interface Props {
  translateButtonClicked: boolean;
  onClick: () => void;
  idea: GetIdeaChildProps;
  locale: GetLocaleChildProps;
}

const IdeasShowTranslateButton = ({
  idea,
  locale,
  translateButtonClicked,
  onClick,
}: Props) => {
  const showTranslateButton =
    !isNilOrError(idea) &&
    !isNilOrError(locale) &&
    !idea.attributes.title_multiloc[locale];

  return (
    <FeatureFlag name="machine_translations">
      {showTranslateButton && (
        <StyledTranslateButton
          translateButtonClicked={translateButtonClicked}
          onClick={onClick}
        />
      )}
    </FeatureFlag>
  );
};

export default IdeasShowTranslateButton;
