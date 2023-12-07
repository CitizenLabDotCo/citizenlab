import BannerButton, {
  BannerButtonStyle,
} from 'components/LandingPages/citizen/BannerButton';
import SignUpButton from 'containers/HomePage/SignUpButton';
import useLocalize from 'hooks/useLocalize';
import React, { KeyboardEvent, MouseEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/CraftComponents/HomepageBanner';

interface Props {
  buttonStyle: BannerButtonStyle;
  signUpIn: (event: MouseEvent | KeyboardEvent) => void;
  homepageSettings: Partial<IHomepageBannerSettings>;
}

const CTA = ({ buttonStyle, signUpIn, homepageSettings }: Props) => {
  const localize = useLocalize();

  if (!isNilOrError(homepageSettings)) {
    const ctaType = homepageSettings.banner_cta_signed_out_type;

    const customButtonText =
      homepageSettings.banner_cta_signed_out_text_multiloc;

    const customButtonUrl = homepageSettings.banner_cta_signed_out_url;

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
