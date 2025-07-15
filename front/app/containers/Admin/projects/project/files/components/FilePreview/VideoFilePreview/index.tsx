import React from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';

type Props = {
  url: string;
};

const VideoFilePreview = ({ url }: Props) => {
  return (
    <Box mt="24px">
      <video
        src={url}
        controls
        style={{
          width: '100%',
          maxHeight: '500px',
          borderRadius: stylingConsts.borderRadius,
        }}
      />
    </Box>
  );
};

export default VideoFilePreview;
