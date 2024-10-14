import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

interface Props {
  title_multiloc?: Multiloc;
}

const SpotlightProject = ({ title_multiloc }: Props) => {
  const localize = useLocalize();

  return (
    <Box maxWidth="1200px">
      {title_multiloc ? localize(title_multiloc) : 'TODO'}
    </Box>
  );
};

export default SpotlightProject;
