import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { ICustomPageData } from 'api/custom_pages/types';

import useLocalize from 'hooks/useLocalize';

interface Props {
  option?: ICustomPageData;
}

const OptionLabel = ({ option }: Props) => {
  const localize = useLocalize();

  if (!option) return null;

  return <Box>{localize(option.attributes.title_multiloc)}</Box>;
};

export default OptionLabel;
