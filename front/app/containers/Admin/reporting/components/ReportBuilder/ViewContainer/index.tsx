import React, { useMemo } from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

// constants
import {
  MAX_REPORT_WIDTH,
  A4_WIDTH,
  A4_HEIGHT,
} from 'containers/Admin/reporting/constants';

// typings
import { View } from './typings';

interface Props {
  view: View;
  children: React.ReactNode;
}

const getBoxProps = (view: View) => {
  if (view === 'pdf') {
    const outerBox: BoxProps = {
      width: A4_WIDTH,
    };

    const innerBox: BoxProps = {
      width: '100%',
      minHeight: A4_HEIGHT,
      background: 'white',
      px: '30px',
      py: '30px',
    };

    return { outerBox, innerBox };
  }

  const outerBox: BoxProps = {
    width: view === 'phone' ? '360px' : '1140px',
    height: '620px',
    border: 'solid black',
    borderWidth: '40px 20px 20px 20px',
    zIndex: '1',
    mb: '12px',
    py: view === 'phone' ? '20px' : '40px',
    borderRadius: '20px',
    overflowX: 'hidden',
    overflowY: 'scroll',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  };

  const innerBox: BoxProps = {
    maxWidth: MAX_REPORT_WIDTH,
    w: '100%',
    px: view === 'phone' ? '20px' : '0px',
  };

  return { outerBox, innerBox };
};

const ViewContainer = ({ view, children }: Props) => {
  const { outerBox, innerBox } = useMemo(() => getBoxProps(view), [view]);

  // This is set up like this because this function can only have one return statement
  // because of the setup with craftjs.
  // If we have multiple return statements based on the view,
  // when the view changes, the children are unmounted and remounted-
  // and this crashes everything for some reason. Seems to be a weird
  // craftjs bug. So don't touch this unless you know what you're doing.
  return (
    <Box {...outerBox}>
      <Box {...innerBox}>{children}</Box>
    </Box>
  );
};

export default ViewContainer;
