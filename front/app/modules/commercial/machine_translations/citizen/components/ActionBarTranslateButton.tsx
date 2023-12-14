import React from 'react';

import FeatureFlag from 'components/FeatureFlag';
import { isNilOrError } from 'utils/helperUtils';
import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import TranslateButton from 'components/UI/TranslateButton';
import { GetLocaleChildProps } from 'resources/GetLocale';
import { IInitiativeData } from 'api/initiatives/types';

const StyledTranslateButton = styled(TranslateButton)`
  ${media.phone`
    display: none;
  `}
`;

interface Props {
  translateButtonClicked: boolean;
  onClick: () => void;
  initiative: IInitiativeData;
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
