import React from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';

// typings
import { Multiloc } from 'typings';

interface Props {
  title: Multiloc;
}

const Header = ({ title }: Props) => {
  const localize = useLocalize();

  return (
    <Box p="20px 40px 0px 40px" display="flex" justifyContent="space-between">
      <Title variant="h3" as="h2">
        {localize(title)}
      </Title>
      <Box display="flex" alignItems="center"></Box>
    </Box>
  );
};

export default Header;
