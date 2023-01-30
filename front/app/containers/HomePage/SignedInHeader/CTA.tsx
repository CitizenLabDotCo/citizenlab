import BannerButton, {
  BannerButtonStyle,
} from 'components/LandingPages/citizen/BannerButton';
import SignUpButton from 'containers/HomePage/SignUpButton';
import useHomepageSettings from 'hooks/useHomepageSettings';
import useLocalize from 'hooks/useLocalize';
import React, { KeyboardEvent, MouseEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  buttonStyle: BannerButtonStyle;
  signUpIn?: (event: MouseEvent | KeyboardEvent) => void;
  signedIn: boolean;
}

const CTA = ({ buttonStyle, signUpIn, signedIn }: Props) => {
  const localize = useLocalize();
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const ctaType = signedIn
      ? homepageSettings.attributes.banner_cta_signed_in_type
      : homepageSettings.attributes.banner_cta_signed_out_type;

    const customButtonText = signedIn
      ? homepageSettings.attributes.banner_cta_signed_in_text_multiloc
      : homepageSettings.attributes.banner_cta_signed_out_text_multiloc;

    const customButtonUrl = signedIn
      ? homepageSettings.attributes.banner_cta_signed_in_url
      : homepageSettings.attributes.banner_cta_signed_out_url;

    switch (ctaType) {
      case 'sign_up_button':
        return signUpIn ? (
          <SignUpButton buttonStyle={buttonStyle} signUpIn={signUpIn} />
        ) : null;
      case 'customized_button':
        return homepageSettings ? (
          <BannerButton
            buttonStyle={buttonStyle}
            text={localize(customButtonText)}
            linkTo={customButtonUrl}
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
