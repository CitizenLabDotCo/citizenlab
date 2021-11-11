import React, { MouseEvent, KeyboardEvent } from 'react';
import SignUpButton from 'containers/LandingPage/SignUpButton';
import CTAButton from 'containers/LandingPage/CTAButton';
import useLocalize from 'hooks/useLocalize';
import {
  CTASignedInType,
  CTASignedOutType,
  CustomizedButtonConfig,
} from 'services/appConfiguration';

interface Props {
  ctaType: CTASignedOutType | CTASignedInType;
  customizedButtonConfig?: CustomizedButtonConfig;
  signUpIn?: (event: MouseEvent | KeyboardEvent) => void;
}

const CTA = ({ ctaType, customizedButtonConfig, signUpIn }: Props) => {
  const localize = useLocalize();

  switch (ctaType) {
    case 'sign_up_button':
      return signUpIn ? <SignUpButton signUpIn={signUpIn} /> : null;
    case 'customized_button':
      return customizedButtonConfig ? (
        <CTAButton
          text={localize(customizedButtonConfig.text)}
          linkTo={customizedButtonConfig.url}
          openLinkInNewTab={true}
        />
      ) : null;
    case 'no_button':
      return null;
  }
};

export default CTA;
