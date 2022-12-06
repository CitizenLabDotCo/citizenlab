import React from 'react';
import styled from 'styled-components';
import { GetInitiativeChildProps } from 'resources/GetInitiative';
import { GetLocaleChildProps } from 'resources/GetLocale';
import { isNilOrError } from 'utils/helperUtils';
import { media } from 'utils/styleUtils';
import FeatureFlag from 'components/FeatureFlag';
import TranslateButton from 'components/UI/TranslateButton';

const StyledTranslateButton = styled(TranslateButton)`
  ${media.phone`
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
