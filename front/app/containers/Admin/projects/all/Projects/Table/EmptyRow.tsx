import React from 'react';

import { Tr, Td, colors } from '@citizenlab/cl2-component-library';

const EmptyRow = () => {
  return (
    <Tr>
      <Td background={colors.grey50} h="40px" />
      <Td background={colors.grey50} width="1px" />
      <Td background={colors.grey50} width="100px" />
      <Td background={colors.grey50} width="140px" />
      <Td background={colors.grey50} width="140px" />
      <Td background={colors.grey50} width="120px" />
      <Td background={colors.grey50} width="120px" />
      <Td background={colors.grey50} width="50px" />
    </Tr>
  );
};

export default EmptyRow;
