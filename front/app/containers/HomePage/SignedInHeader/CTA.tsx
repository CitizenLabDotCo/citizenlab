import BannerButton, {
  BannerButtonStyle,
} from 'components/LandingPages/citizen/BannerButton';
import useHomepageSettings from 'hooks/useHomepageSettings';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  buttonStyle: BannerButtonStyle;
}

const CTA = ({ buttonStyle }: Props) => {
  const localize = useLocalize();
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const ctaType = homepageSettings.attributes.banner_cta_signed_in_type;

    const customButtonText =
      homepageSettings.attributes.banner_cta_signed_in_text_multiloc;

    const customButtonUrl =
      homepageSettings.attributes.banner_cta_signed_in_url;

    switch (ctaType) {
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
