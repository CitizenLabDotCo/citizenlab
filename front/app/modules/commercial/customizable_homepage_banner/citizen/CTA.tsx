import React, { MouseEvent, KeyboardEvent } from 'react';
import SignUpButton from 'containers/LandingPage/SignUpButton';
import BannerButton, {
  BannerButtonStyle,
} from 'containers/LandingPage/BannerButton';
import useLocalize from 'hooks/useLocalize';
import { CustomizedButtonConfig } from 'services/appConfiguration';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  customizedButtonConfig?: CustomizedButtonConfig;
  buttonStyle: BannerButtonStyle;
  signUpIn?: (event: MouseEvent | KeyboardEvent) => void;
  signedIn: boolean;
}

const CTA = ({
  customizedButtonConfig,
  buttonStyle,
  signUpIn,
  signedIn,
}: Props) => {
  const localize = useLocalize();
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const ctaType = signedIn
      ? homepageSettings.data.attributes.banner_cta_signed_in_type
      : homepageSettings.data.attributes.banner_cta_signed_out_type;

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
  }

  return null;
};

export default CTA;
