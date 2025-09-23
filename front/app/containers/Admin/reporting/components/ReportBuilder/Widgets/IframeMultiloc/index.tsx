import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import AspectRatioContainer from 'components/admin/ContentBuilder/Widgets/IframeMultiloc/components/AspectRatioContainer';
import EmbedSettings from 'components/admin/ContentBuilder/Widgets/IframeMultiloc/components/EmbedSettings';
import { DEFAULT_PROPS } from 'components/admin/ContentBuilder/Widgets/IframeMultiloc/constants';
import messages from 'components/admin/ContentBuilder/Widgets/IframeMultiloc/messages';
import {
  getAspectRatioPercentage,
  getResponsiveHeight,
} from 'components/admin/ContentBuilder/Widgets/IframeMultiloc/utils';

export interface Props {
  url: string;
  height: number;
  title?: Multiloc;
  // New hybrid mode properties
  embedMode?: 'fixed' | 'aspectRatio';
  tabletHeight?: number;
  mobileHeight?: number;
  aspectRatio?: '16:9' | '4:3' | '3:4' | '1:1' | 'custom';
  customAspectRatio?: string;
}

const IframeMultiloc = ({
  url,
  height,
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

  const responsiveHeight = getResponsiveHeight(
    embedMode,
    height,
    isMobile,
    isTablet,
    tabletHeight,
    mobileHeight
  );

  const aspectRatioPercentage =
    embedMode === 'aspectRatio'
      ? getAspectRatioPercentage(aspectRatio, customAspectRatio)
      : null;

  const renderIframe = () => {
    const iframeProps = {
      src: url,
      title: localize(title),
      width: '100%',
      style: { border: '0px' },
    };

    if (embedMode === 'aspectRatio' && aspectRatioPercentage) {
      return (
        <AspectRatioContainer aspectRatioPercentage={aspectRatioPercentage}>
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
    >
      {url && renderIframe()}
    </Box>
  );
};

IframeMultiloc.craft = {
  props: DEFAULT_PROPS,
  related: {
    settings: EmbedSettings,
  },
};

export const iframeMultilocTitle = messages.url;

export default IframeMultiloc;
