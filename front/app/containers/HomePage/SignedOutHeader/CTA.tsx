import BannerButton, {
  BannerButtonStyle,
} from 'components/LandingPages/citizen/BannerButton';
import SignUpButton from 'containers/HomePage/SignUpButton';
import useHomepageSettings from 'api/homepage_settings/useHomepageSettings';
import useLocalize from 'hooks/useLocalize';
import React, { KeyboardEvent, MouseEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  buttonStyle: BannerButtonStyle;
  signUpIn: (event: MouseEvent | KeyboardEvent) => void;
}

const CTA = ({ buttonStyle, signUpIn }: Props) => {
  const localize = useLocalize();
  const { data: homepageSettings } = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const ctaType = homepageSettings.data.attributes.banner_cta_signed_out_type;

    const customButtonText =
      homepageSettings.data.attributes.banner_cta_signed_out_text_multiloc;

    const customButtonUrl =
      homepageSettings.data.attributes.banner_cta_signed_out_url;

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
            openLinkInNewTab
          />
        ) : null;
      case 'no_button':
        return null;
    }
  }

  return null;
};

export default CTA;
