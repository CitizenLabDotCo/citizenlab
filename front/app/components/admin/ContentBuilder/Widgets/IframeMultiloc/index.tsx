import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import { isYouTubeEmbedLink } from 'utils/urlUtils';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

import AspectRatioContainer from './components/AspectRatioContainer';
import EmbedSettings from './components/EmbedSettings';
import messages from './messages';
import { IframeProps, getResponsiveHeight } from './utils';

const IframeMultiloc = ({
  url = '',
  height = 500,
  hasError,
  title,
  embedMode = 'fixed',
  tabletHeight,
  mobileHeight,
  aspectRatio = '16:9',
  customAspectRatio,
}: IframeProps) => {
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

  const iframeProps = {
    src: url,
    title: localize(title),
    width: '100%',
    style: { border: '0px' },
  };

  return (
    <Box
      className="e2e-content-builder-iframe-component"
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
      {!hasError &&
        url &&
        (embedMode === 'aspectRatio' ? (
          <AspectRatioContainer
            aspectRatio={aspectRatio}
            customAspectRatio={customAspectRatio}
          >
            <iframe
              referrerPolicy={
                isYouTubeEmbedLink(iframeProps.src)
                  ? 'strict-origin-when-cross-origin'
                  : undefined
              }
              {...iframeProps}
              height="100%"
            />
          </AspectRatioContainer>
        ) : (
          <iframe
            referrerPolicy={
              isYouTubeEmbedLink(iframeProps.src)
                ? 'strict-origin-when-cross-origin'
                : undefined
            }
            {...iframeProps}
            height={responsiveHeight}
          />
        ))}
    </Box>
  );
};

IframeMultiloc.craft = {
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
