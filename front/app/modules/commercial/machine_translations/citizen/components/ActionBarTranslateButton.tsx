import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IInitiativeData } from 'api/initiatives/types';

import useLocale from 'hooks/useLocale';

import FeatureFlag from 'components/FeatureFlag';
import TranslateButton from 'components/UI/TranslateButton';

import { isNilOrError } from 'utils/helperUtils';

const StyledTranslateButton = styled(TranslateButton)`
  ${media.phone`
    display: none;
  `}
`;

interface Props {
  translateButtonClicked: boolean;
  onClick: () => void;
  initiative: IInitiativeData;
}

const ActionBarTranslateButton = ({
  initiative,
  onClick,
  translateButtonClicked,
}: Props) => {
  const locale = useLocale();
  const showTranslateButton =
    !isNilOrError(initiative) && !initiative.attributes.title_multiloc[locale];

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
