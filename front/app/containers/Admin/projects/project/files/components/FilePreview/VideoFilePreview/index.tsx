import React from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';

type Props = {
  url: string;
  title?: string;
};

const VideoFilePreview = ({ url, title }: Props) => {
  return (
    <Box mt="24px">
      <video
        src={url}
        title={title}
        controls
        preload="metadata"
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
