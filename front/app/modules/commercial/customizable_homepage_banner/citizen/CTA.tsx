import { SignUpButton, CTAButton } from 'containers/LandingPage/SignUpButton';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import {
  CTASignedInType,
  CTASignedOutType,
  CustomizedButtonConfig,
} from 'services/appConfiguration';

interface Props {
  ctaType: CTASignedOutType | CTASignedInType;
  customizedButtonConfig?: CustomizedButtonConfig;
  signUpIn?: (event) => void;
}

const CTA = ({ ctaType, customizedButtonConfig, signUpIn }: Props) => {
  const localize = useLocalize();

  switch (ctaType) {
    case 'sign_up_button':
      return <SignUpButton signUpIn={signUpIn!} />;
    case 'customized_button':
      return (
        <CTAButton
          text={localize(customizedButtonConfig!.text)}
          linkTo={customizedButtonConfig!.url}
          openLinkInNewTab={true}
        />
      );
    default:
      return <></>;
  }
};

export default CTA;
