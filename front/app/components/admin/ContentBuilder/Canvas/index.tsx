import React from 'react';

import { stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import {
  TOOLBOX_WIDTH,
  SETTINGS_PANEL_WIDTH,
} from 'components/admin/ContentBuilder/constants';
import useIsSettingsPanelOpen from 'components/admin/ContentBuilder/Settings/useIsSettingsPanelOpen';

const GUTTER = '24px';

// The toolbox and settings panel are fixed overlays at the viewport edges, so the
// canvas reserves their widths via padding to keep the centered content clear of
// both. "safe center" falls back to start-alignment (instead of clipping the
// start under the toolbox) when content is too wide to fit.
const Container = styled.div<{ $toolboxWidth: string; $panelOpen: boolean }>`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: safe center;
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  overflow: auto;
  padding-top: 24px;
  padding-bottom: 80px;
  padding-left: calc(${({ $toolboxWidth }) => $toolboxWidth} + ${GUTTER});
  padding-right: ${({ $panelOpen }) =>
    $panelOpen ? `calc(${SETTINGS_PANEL_WIDTH} + ${GUTTER})` : GUTTER};
  transition: padding-right 120ms ease;

  @media print {
    padding: 0;
  }
`;

type Props = {
  children: React.ReactNode;
  toolboxWidth?: string;
};

const ContentBuilderCanvas = ({
  children,
  toolboxWidth = TOOLBOX_WIDTH,
}: Props) => {
  const panelOpen = useIsSettingsPanelOpen();

  return (
    <Container $toolboxWidth={toolboxWidth} $panelOpen={panelOpen}>
      {children}
    </Container>
  );
};

export default ContentBuilderCanvas;
