import React from 'react';

// components
import { Box, Text, Title, Button } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';

// routing
import { useParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';

const Idea = () => {
  const { id } = useParams();

  return (
    <Box
      bgColor={colors.red800}
      my="20px"
      p="20px"
      w="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box bgColor={colors.grey300} borderRadius="3px" p="2px" mb="20px">
        <Link to="/testing/project/my-project">Link to project</Link>
      </Box>
      <Box bgColor={colors.grey300} borderRadius="3px" p="2px">
        <Button onClick={() => clHistory.back()}>Go back</Button>
      </Box>
      <Title color="white">Idea {id}</Title>
      <Text mt="0px" mb="20px" color="white">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper
        morbi tincidunt ornare massa eget egestas. Maecenas sed enim ut sem
        viverra aliquet eget sit. Risus quis varius quam quisque id diam vel.
        Sed libero enim sed faucibus turpis in. Turpis cursus in hac habitasse.
        Sit amet nulla facilisi morbi. Lorem ipsum dolor sit amet consectetur
        adipiscing. Maecenas volutpat blandit aliquam etiam erat velit
        scelerisque in. Lorem dolor sed viverra ipsum. Tristique risus nec
        feugiat in fermentum posuere urna. Et ultrices neque ornare aenean
        euismod. Fringilla phasellus faucibus scelerisque eleifend donec pretium
        vulputate sapien nec. Feugiat nisl pretium fusce id velit ut. Gravida
        arcu ac tortor dignissim convallis aenean et tortor. Quisque non tellus
        orci ac auctor augue. Blandit turpis cursus in hac. Mi in nulla posuere
        sollicitudin aliquam ultrices sagittis orci. Pellentesque massa placerat
        duis ultricies lacus sed. In metus vulputate eu scelerisque felis
        imperdiet proin.
      </Text>
    </Box>
  );
};

export default Idea;
