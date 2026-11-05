import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { getMapScreenshot } from 'utils/mapViewRegistry';

interface Props {
  customFieldId: string;
}

const StaticMapScreenshot = ({ customFieldId }: Props) => {
  const dataUrl = getMapScreenshot(customFieldId);

  if (!dataUrl) {
    return null;
  }

  return (
    <Box>
      <img
        src={dataUrl}
        alt=""
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </Box>
  );
};

export default StaticMapScreenshot;
