import React from 'react';

import { Tr, Td, colors } from '@citizenlab/cl2-component-library';

const EmptyRow = () => (
  <Tr>
    <Td background={colors.grey50} />
    <Td background={colors.grey50} width="260px" />
    <Td background={colors.grey50} width="100px" />
    <Td background={colors.grey50} width="40px" />
  </Tr>
);

export default EmptyRow;
