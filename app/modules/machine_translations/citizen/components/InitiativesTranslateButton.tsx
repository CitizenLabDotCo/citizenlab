import FeatureFlag from 'components/FeatureFlag';
import TranslateButton from 'components/UI/TranslateButton';
import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { viewportWidths } from 'utils/styleUtils';

const StyledTranslateButtonMobile = styled(TranslateButton)`
  width: fit-content;
  margin-bottom: 20px;
`;

const InitiativesTranslateButton = ({
  windowSize,
  translateButtonClicked,
  onClick,
  initiative,
  locale,
}) => {
  const showTranslateButton =
    !isNilOrError(initiative) &&
    !isNilOrError(locale) &&
    !initiative.attributes.title_multiloc[locale];

  const isNotDesktop = windowSize
    ? windowSize <= viewportWidths.largeTablet
    : false;

  if (isNotDesktop && showTranslateButton) {
    <FeatureFlag name="machine_translations">
      <StyledTranslateButtonMobile
        translateButtonClicked={translateButtonClicked}
        onClick={onClick}
      />
    </FeatureFlag>;
  }

  return null;
};

export default InitiativesTranslateButton;
