import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import AspectRatioContainer from 'components/admin/ContentBuilder/Widgets/IframeMultiloc/components/AspectRatioContainer';
import EmbedSettings from 'components/admin/ContentBuilder/Widgets/IframeMultiloc/components/EmbedSettings';
import messages from 'components/admin/ContentBuilder/Widgets/IframeMultiloc/messages';
import {
  IframeProps,
  getResponsiveHeight,
} from 'components/admin/ContentBuilder/Widgets/IframeMultiloc/utils';

import { isYouTubeEmbedLink } from 'utils/urlUtils';

type IframeMultilocProps = Pick<
  IframeProps,
  | 'url'
  | 'height'
  | 'title'
  | 'embedMode'
  | 'tabletHeight'
  | 'mobileHeight'
  | 'aspectRatio'
  | 'customAspectRatio'
>;

const IframeMultiloc = ({
  url,
  height,
  title,
  embedMode = 'fixed',
  tabletHeight,
  mobileHeight,
  aspectRatio = '16:9',
  customAspectRatio,
}: IframeMultilocProps) => {
  const localize = useLocalize();
  const isMobile = useBreakpoint('phone');
  const isTablet = useBreakpoint('tablet');

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
    >
      {url &&
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
};

export const iframeMultilocTitle = messages.url;

export default IframeMultiloc;
