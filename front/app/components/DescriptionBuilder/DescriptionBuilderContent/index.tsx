import React from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNode } from '@craftjs/core';
import { SupportedLocale } from 'typings';

import {
  TOOLBOX_WIDTH,
  SETTINGS_PANEL_WIDTH,
} from 'components/admin/ContentBuilder/constants';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import useIsSettingsPanelOpen from 'components/admin/ContentBuilder/Settings/useIsSettingsPanelOpen';

const CONTENT_MAX_WIDTH = '1000px';
// Horizontal breathing room between the content and the toolbox / settings panel.
const GUTTER = '24px';

type Props = {
  selectedLocale: SupportedLocale;
  platformLocale: SupportedLocale;
  editorData?: Record<string, SerializedNode>;
};

const DescriptionBuilderContent = ({
  selectedLocale,
  platformLocale,
  editorData,
}: Props) => {
  const isSettingsPanelOpen = useIsSettingsPanelOpen();

  return (
    <LanguageProvider
      contentBuilderLocale={selectedLocale}
      platformLocale={platformLocale}
    >
      <Box
        // The toolbox and the settings panel are both fixed-positioned overlays
        // pinned to the viewport edges. The canvas grows to fill the remaining
        // space, reserves the toolbox width on the left, and reserves the panel
        // width on the right only while it is open, so the centered content stays
        // fully visible and never sits under the panel.
        flex="1 1 auto"
        minWidth="0"
        display="flex"
        justifyContent="center"
        h={`calc(100vh - ${stylingConsts.menuHeight}px)`}
        overflowY="auto"
        pt="24px"
        pb="80px"
        pl={`calc(${TOOLBOX_WIDTH} + ${GUTTER})`}
        pr={
          isSettingsPanelOpen
            ? `calc(${SETTINGS_PANEL_WIDTH} + ${GUTTER})`
            : GUTTER
        }
        style={{ transition: 'padding-right 120ms ease' }}
      >
        <Box width="100%" maxWidth={CONTENT_MAX_WIDTH} flex="0 1 auto">
          <ContentBuilderFrame editorData={editorData} />
        </Box>
      </Box>
    </LanguageProvider>
  );
};

export default DescriptionBuilderContent;
