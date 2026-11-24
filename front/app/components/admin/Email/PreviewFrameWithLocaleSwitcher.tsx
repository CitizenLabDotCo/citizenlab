import React from 'react';

import { LocaleSwitcher } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import PreviewFrame from './PreviewFrame';

// Margin lives on the switcher, not a wrapper, so it disappears when the switcher renders nothing (single-locale platforms).
const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  margin-bottom: 12px;
`;

type Props = {
  campaignId: string;
  locale: SupportedLocale;
  onLocaleChange: (locale: SupportedLocale) => void;
  showHeaders?: boolean;
  height?: string;
  className?: string;
};

const PreviewFrameWithLocaleSwitcher = ({
  campaignId,
  locale,
  onLocaleChange,
  showHeaders,
  height,
  className,
}: Props) => {
  const locales = useAppConfigurationLocales();

  return (
    <>
      <StyledLocaleSwitcher
        locales={locales ?? []}
        selectedLocale={locale}
        onSelectedLocaleChange={onLocaleChange}
      />
      <PreviewFrame
        campaignId={campaignId}
        showHeaders={showHeaders}
        height={height}
        locale={locale}
        className={className}
      />
    </>
  );
};

export default PreviewFrameWithLocaleSwitcher;
