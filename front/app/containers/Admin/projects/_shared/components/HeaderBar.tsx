import React, { ReactNode } from 'react';

import { Box, bo, colors } from '@citizenlab/cl2-component-library';

// Between the bar and the edges of the window. Pages that show the bar keep
// it this far in, so what it holds, like the main button at its end, sits in
// the same spot on each of them.
export const HEADER_BAR_INSET = '8px';

const HEADER_BAR_HEIGHT = '48px';

interface Props {
  // Before what the bar holds; a page lines it up with its content this way.
  startPadding?: string;
  children: ReactNode;
}

// The bar across the top of the back office's projects pages: where you are
// on the left, what you can do on the right. It has the redesigned project
// page's header sizes, so the main buttons of both sit in the same spot; that
// page still draws its own, in project/backofficeRedesign/Header.
const HeaderBar = ({ startPadding = '26px', children }: Props) => (
  <Box
    as="header"
    display="flex"
    alignItems="center"
    flex={`0 0 ${HEADER_BAR_HEIGHT}`}
    height={HEADER_BAR_HEIGHT}
    pl={startPadding}
    pr="20px"
    background={colors.white}
    borderRadius={bo.panelBorderRadius}
  >
    {children}
  </Box>
);

export default HeaderBar;
