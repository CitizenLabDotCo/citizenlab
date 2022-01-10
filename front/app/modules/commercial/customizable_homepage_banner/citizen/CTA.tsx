import React, { MouseEvent, KeyboardEvent } from 'react';
import SignUpButton from 'containers/LandingPage/SignUpButton';
import BannerButton, {
  BannerButtonStyle,
} from 'containers/LandingPage/BannerButton';
import useLocalize from 'hooks/useLocalize';
import {
  CTASignedInType,
  CTASignedOutType,
  CustomizedButtonConfig,
} from 'services/appConfiguration';

interface Props {
  ctaType: CTASignedOutType | CTASignedInType;
  customizedButtonConfig?: CustomizedButtonConfig;
  buttonStyle: BannerButtonStyle;
  signUpIn?: (event: MouseEvent | KeyboardEvent) => void;
}

const CTA = ({
  ctaType,
  customizedButtonConfig,
  buttonStyle,
  signUpIn,
}: Props) => {
  const localize = useLocalize();

  switch (ctaType) {
    case 'sign_up_button':
      return signUpIn ? (
        <SignUpButton buttonStyle={buttonStyle} signUpIn={signUpIn} />
      ) : null;
    case 'customized_button':
      return customizedButtonConfig ? (
        <BannerButton
          buttonStyle={buttonStyle}
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
