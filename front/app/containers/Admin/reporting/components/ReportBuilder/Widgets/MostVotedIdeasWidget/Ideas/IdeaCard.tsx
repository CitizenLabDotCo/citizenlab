import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  rank: number;
  title: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  imageId?: string;
}

const IdeaCard = ({ title }: Props) => {
  return (
    <Box borderTop="1px solid black" p="16px">
      {title}
    </Box>
  );
};

export default IdeaCard;
