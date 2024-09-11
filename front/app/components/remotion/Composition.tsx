import React from 'react';

import {
  Box,
  Button,
  Image,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import {
  AbsoluteFill,
  Freeze,
  Audio,
  staticFile,
  useCurrentFrame,
} from 'remotion';

import GoVocalManImage from './Resources/govocal_man_train.png';

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const opacity = Math.min(1, frame / 70);
  const translateFromLeft = 1200 * -1 + frame * 50;
  const translateFromRight = 2260 - frame * 50;

  return (
    <Freeze frame={20} active={(f) => f < 20}>
      <Audio src={staticFile('song.mp3')} />
      <AbsoluteFill>
        <Box
          width="100vw"
          height="600px"
          bgColor="#c0ece0"
          display="flex"
          justifyContent="center"
        >
          <Box display="flex">
            <Box width="700px" display="flex">
              <Box
                my="auto"
                style={{
                  transform: `translateX(${
                    translateFromLeft < 0 ? translateFromLeft : 0
                  }px)`,
                }}
              >
                <Title
                  style={{
                    color: '#162466',
                    fontSize: '42px',
                    fontWeight: 400,
                  }}
                >
                  The only tool you need for meaningful community engagement
                </Title>
                <Text style={{ color: '#162466', fontWeight: 200 }}>
                  Enhance decision-making and build trust in your community by
                  engaging large audiences with one centralized tool,
                  streamlining project management, and improving input analysis.
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
            <Box
              my="auto"
              style={{
                transform: `translateX(${
                  translateFromRight > 0 ? translateFromRight : 0
                }px)`,
                opacity: Math.min(1, frame / 100),
              }}
            >
              <Box width="700px" ml="80px">
                <Box style={{ opacity }}>
                  <Image alt="" src={GoVocalManImage} height="460px" />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </AbsoluteFill>
    </Freeze>
  );
};
