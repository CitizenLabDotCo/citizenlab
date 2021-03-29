import React from 'react';

import FeatureFlag from 'components/FeatureFlag';
import { isNilOrError } from 'utils/helperUtils';
import { media } from 'utils/styleUtils';
import styled from 'styled-components';
import TranslateButton from 'components/UI/TranslateButton';
import { GetLocaleChildProps } from 'resources/GetLocale';
import { GetInitiativeChildProps } from 'resources/GetInitiative';

const StyledTranslateButton = styled(TranslateButton)`
  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

interface Props {
  translateButtonClicked: boolean;
  onClick: () => void;
  initiative: GetInitiativeChildProps;
  locale: GetLocaleChildProps;
}

const ActionBarTranslateButton = ({
  initiative,
  locale,
  onClick,
  translateButtonClicked,
}: Props) => {
  const showTranslateButton =
    !isNilOrError(initiative) &&
    !isNilOrError(locale) &&
    !initiative.attributes.title_multiloc[locale];

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

export default ActionBarTranslateButton;
