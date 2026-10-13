import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import messages from './messages';
import Settings from './Settings';

const Container = styled.div`
  overflow: hidden;
  padding-bottom: 56.25%;
  position: relative;
  height: 0;

  iframe {
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    position: absolute;
  }
`;

interface Props {
  markup: string;
}

const VideoEmbed = ({ markup }: Props) => {
  return (
    <Box w="100%" display="flex" justifyContent="center">
      <Box w="800px">
        <Container>
          <div dangerouslySetInnerHTML={{ __html: markup }} />
        </Container>
      </Box>
    </Box>
  );
};

VideoEmbed.craft = {
  related: {
    settings: Settings,
  },
};

export const videoEmbedTitle = messages.videoEmbed;

export default VideoEmbed;
