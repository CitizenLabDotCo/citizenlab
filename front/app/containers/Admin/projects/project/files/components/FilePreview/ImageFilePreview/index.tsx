import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

type Props = {
  url: string;
};

const ImageFilePreview = ({ url }: Props) => {
  return (
    <Box>
      <img src={url} alt="" style={{ width: '100%', height: 'auto' }} />
    </Box>
  );
};

export default ImageFilePreview;
