import FeatureFlag from 'components/FeatureFlag';
import TranslateButton from 'components/UI/TranslateButton';
import React from 'react';
import { GetInitiativeChildProps } from 'resources/GetInitiative';
import { GetLocaleChildProps } from 'resources/GetLocale';
import { GetWindowSizeChildProps } from 'resources/GetWindowSize';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { viewportWidths } from 'utils/styleUtils';

const StyledTranslateButtonMobile = styled(TranslateButton)`
  width: fit-content;
  margin-bottom: 20px;
`;

interface Props {
  windowSize: GetWindowSizeChildProps;
  translateButtonClicked: boolean;
  onClick: () => void;
  initiative: GetInitiativeChildProps;
  locale: GetLocaleChildProps;
}

const InitiativesTranslateButton = ({
  windowSize,
  translateButtonClicked,
  onClick,
  initiative,
  locale,
}: Props) => {
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
