import React from 'react';

import {
  Box,
  Button,
  Image,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { useCurrentFrame } from 'remotion';

import GoVocalImage from './Resources/GV_Logo.png';

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const opacity = Math.min(1, frame / 70);

  return (
    <Box
      width="100vw"
      height="600"
      bgColor="#c0ece0"
      display="flex"
      justifyContent="center"
    >
      <Box display="flex">
        <Box width="700px" display="flex">
          <Box my="auto">
            <Title
              style={{ color: '#162466', fontSize: '42px', fontWeight: 400 }}
            >
              The only tool you need for meaningful community engagement
            </Title>
            <Text style={{ color: '#162466', fontWeight: 200 }}>
              Enhance decision-making and build trust in your community by
              engaging large audiences with one centralized tool, streamlining
              project management, and improving input analysis.
            </Text>
            <Button
              iconPos="right"
              icon="arrow-right"
              borderRadius="20px"
              bgColor="#162466"
              width="200px"
            >
              Schedule a demo
            </Button>
          </Box>
        </Box>
        <Box width="700px" style={{ opacity }}>
          Images with animation here:
          <Image alt="" src={GoVocalImage} height="200px" />
          {frame > 70 && <h1>Frame greater than 70</h1>}
        </Box>
      </Box>
    </Box>
  );
};
