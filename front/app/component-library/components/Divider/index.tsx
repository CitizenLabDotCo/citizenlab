import React from 'react';

import { Box, BoxMarginProps, colors } from '@citizenlab/cl2-component-library';

const Divider = ({
  className,
  ...rest
}: { className?: string } & BoxMarginProps) => (
  <Box
    className={className}
    as="hr"
    display="block"
    height="1px"
    border="0"
    borderTop={`1px solid ${colors.divider}`}
    margin="1em 0"
    padding="0"
    width="100%"
    {...rest}
  />
);

export default Divider;
