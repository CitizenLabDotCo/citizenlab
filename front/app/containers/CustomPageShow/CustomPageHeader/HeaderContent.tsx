import React from 'react';
import useLocalize from 'hooks/useLocalize';
import {
  Container,
  HeaderTitle,
  HeaderSubtitle,
} from 'containers/LandingPage/SignedOutHeader/HeaderContent';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { Multiloc } from 'typings';

type TAlign = 'center' | 'left';
interface Props {
  fontColors: 'light' | 'dark';
  align?: TAlign;
  headerMultiloc: Multiloc;
  subheaderMultiloc: Multiloc;
  hasHeaderBannerImage: boolean;
}

function getAlignItems(align: TAlign) {
  if (align === 'center') return 'center';
  if (align === 'left') return 'flex-start';

  return undefined;
}

const HeaderContent = ({
  align = 'center',
  fontColors,
  headerMultiloc,
  subheaderMultiloc,
  hasHeaderBannerImage,
}: //   intl: { formatMessage },
Props & InjectedIntlProps) => {
  const localize = useLocalize();

  const formattedHeaderTitle = headerMultiloc
    ? localize(headerMultiloc)
    : 'Placeholder: no header multiloc';

  const formattedSubheaderTitle = subheaderMultiloc
    ? localize(subheaderMultiloc)
    : 'Placeholder: no subheader multiloc';

  return (
    <Container
      id="hook-header-content"
      className="e2e-signed-out-header-title"
      alignTo={getAlignItems(align)}
      align={align}
    >
      <HeaderTitle
        hasHeader={hasHeaderBannerImage}
        fontColors={fontColors}
        align={align}
      >
        {formattedHeaderTitle}
      </HeaderTitle>

      <HeaderSubtitle
        hasHeader={hasHeaderBannerImage}
        className="e2e-signed-out-header-subtitle"
        displayHeaderAvatars={false}
        fontColors={fontColors}
        align={align}
      >
        {formattedSubheaderTitle}
      </HeaderSubtitle>
    </Container>
  );
};

export default injectIntl(HeaderContent);
