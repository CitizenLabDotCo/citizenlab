import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { SupportedLocale, Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

import AspectRatioContainer from './components/AspectRatioContainer';
import EmbedSettings from './components/EmbedSettings';
import { DEFAULT_PROPS } from './constants';
import messages from './messages';
import { AspectRatioType, EmbedModeType, getResponsiveHeight } from './utils';

interface Props {
  url: string;
  height: number;
  hasError: boolean;
  errorType?: string;
  title?: Multiloc;
  selectedLocale: SupportedLocale;
  embedMode?: EmbedModeType;
  tabletHeight?: number;
  mobileHeight?: number;
  aspectRatio?: AspectRatioType;
  customAspectRatio?: string;
}

const IframeMultiloc = ({
  url,
  height,
  hasError,
  title,
  embedMode = 'fixed',
  tabletHeight,
  mobileHeight,
  aspectRatio = '16:9',
  customAspectRatio,
}: Props) => {
  const localize = useLocalize();
  const isMobile = useBreakpoint('phone');
  const isTablet = useBreakpoint('tablet');
  const componentDefaultPadding = useCraftComponentDefaultPadding();

  const responsiveHeight = getResponsiveHeight(
    embedMode,
    height,
    isMobile,
    isTablet,
    tabletHeight,
    mobileHeight
  );

  const renderIframe = () => {
    const iframeProps = {
      src: url,
      title: localize(title),
      width: '100%',
      style: { border: '0px' },
    };

    if (embedMode === 'aspectRatio') {
      return (
        <AspectRatioContainer
          aspectRatio={aspectRatio}
          customAspectRatio={customAspectRatio}
        >
          <iframe {...iframeProps} height="100%" />
        </AspectRatioContainer>
      );
    }

    return <iframe {...iframeProps} height={responsiveHeight} />;
  };

  return (
    <Box
      className="e2e-content-builder-iframe-component"
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
      {!hasError && url && renderIframe()}
    </Box>
  );
};

IframeMultiloc.craft = {
  props: DEFAULT_PROPS,
  related: {
    settings: EmbedSettings,
  },
  custom: {
    title: messages.url,
    noPointerEvents: true,
  },
};

export const iframeTitle = messages.url;

export default IframeMultiloc;
