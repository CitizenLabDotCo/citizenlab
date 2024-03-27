import React from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IInitiativeData } from 'api/initiatives/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import TranslateButton from 'components/UI/TranslateButton';

import { isNilOrError } from 'utils/helperUtils';

const StyledTranslateButtonMobile = styled(TranslateButton)`
  width: fit-content;
  margin-bottom: 20px;
`;

interface Props {
  translateButtonClicked: boolean;
  onClick: () => void;
  initiative: IInitiativeData;
}

const InitiativesTranslateButton = ({
  translateButtonClicked,
  onClick,
  initiative,
}: Props) => {
  const locale = useLocale();
  const showTranslateButton =
    !isNilOrError(initiative) && !initiative.attributes.title_multiloc[locale];

  const isSmallerThanTablet = useBreakpoint('tablet');
  const machineTranslationsEnabled = useFeatureFlag({
    name: 'machine_translations',
  });

  if (
    machineTranslationsEnabled &&
    isSmallerThanTablet &&
    showTranslateButton
  ) {
    return (
      <StyledTranslateButtonMobile
        translateButtonClicked={translateButtonClicked}
        onClick={onClick}
      />
    );
  }

  return null;
};

export default InitiativesTranslateButton;
