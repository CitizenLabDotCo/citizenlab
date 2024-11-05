import React from 'react';

import useLocalize from 'hooks/useLocalize';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';

import BannerButton, {
  BannerButtonStyle,
} from 'components/LandingPages/citizen/BannerButton';

import { isNilOrError } from 'utils/helperUtils';

interface Props {
  buttonStyle: BannerButtonStyle;
  homepageSettings: Partial<IHomepageBannerSettings>;
}

const CTA = ({ buttonStyle, homepageSettings }: Props) => {
  const localize = useLocalize();

  if (!isNilOrError(homepageSettings)) {
    const ctaType = homepageSettings.banner_cta_signed_in_type;

    const customButtonText =
      homepageSettings.banner_cta_signed_in_text_multiloc;

    const customButtonUrl = homepageSettings.banner_cta_signed_in_url;

    switch (ctaType) {
      case 'customized_button':
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
