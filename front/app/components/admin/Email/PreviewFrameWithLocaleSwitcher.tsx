import React, { useState } from 'react';

import { Box, LocaleSwitcher } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import PreviewFrame from './PreviewFrame';

// Margin lives on the switcher, not a wrapper, so it disappears when the switcher renders nothing (single-locale platforms).
const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  margin-bottom: 12px;
`;

type Props = {
  campaignId: string;
  height: string;
};

const PreviewFrameWithLocaleSwitcher = ({ campaignId, height }: Props) => {
  const currentLocale = useLocale();
  const locales = useAppConfigurationLocales();
  const [previewLocale, setPreviewLocale] =
    useState<SupportedLocale>(currentLocale);

  const handlePreviewLocaleChange = (locale: SupportedLocale) => {
    setPreviewLocale(locale);
  };

  return (
    <>
      {locales && (
        <StyledLocaleSwitcher
          locales={locales}
          selectedLocale={previewLocale}
          onSelectedLocaleChange={handlePreviewLocaleChange}
        />
      )}
      <Box>
        <PreviewFrame
          campaignId={campaignId}
          showHeaders={true}
          height={height}
          locale={previewLocale}
        />
      </Box>
    </>
  );
};

export default PreviewFrameWithLocaleSwitcher;
