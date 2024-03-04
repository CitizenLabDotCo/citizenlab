import React from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { GetLocaleChildProps } from 'resources/GetLocale';
import styled from 'styled-components';

import TranslateButton from 'components/UI/TranslateButton';

import { isNilOrError } from 'utils/helperUtils';

import { IInitiativeData } from 'api/initiatives/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

const StyledTranslateButtonMobile = styled(TranslateButton)`
  width: fit-content;
  margin-bottom: 20px;
`;

interface Props {
  translateButtonClicked: boolean;
  onClick: () => void;
  initiative: IInitiativeData;
  locale: GetLocaleChildProps;
}

const InitiativesTranslateButton = ({
  translateButtonClicked,
  onClick,
  initiative,
  locale,
}: Props) => {
  const showTranslateButton =
    !isNilOrError(initiative) &&
    !isNilOrError(locale) &&
    !initiative.attributes.title_multiloc[locale];

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
