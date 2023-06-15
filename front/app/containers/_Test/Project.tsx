import React, { useState } from 'react';

import {
  Box,
  Text,
  Select,
  IOption,
  Title,
} from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';

// routing
import { useParams } from 'react-router-dom';

const IdeaCard = ({ i }: { i: number }) => {
  return (
    <Box
      bgColor={colors.blue700}
      my="20px"
      p="20px"
      w="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Text mt="0px" mb="20px" color="white">
        Idea number {i}
      </Text>
      <Link to={`/testing/ideas/${i}`}>Go to idea</Link>
    </Box>
  );
};

const cardIndices = [...Array(10).keys()];

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

const Project = () => {
  const { slug } = useParams();
  const [option, setOption] = useState<IOption>({
    value: 'a',
    label: 'Option A',
  });

  return (
    <Box bgColor={colors.tealLight} w="100%" p="20px">
      <Title>{slug}</Title>

      <Box p="20px" mb="40px">
        <Select value={option} options={options} onChange={setOption} />
      </Box>

      {cardIndices.map((i) => (
        <IdeaCard i={i} key={i} />
      ))}
    </Box>
  );
};

export default Project;
