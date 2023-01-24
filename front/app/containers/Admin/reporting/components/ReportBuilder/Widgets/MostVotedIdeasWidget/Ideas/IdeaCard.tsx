import React from 'react';

// styling
import styled from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';
import { BORDER } from '../../constants';

// components
import { Box, Text, Title } from '@citizenlab/cl2-component-library';

interface Props {
  rank: number;
  title: string;
  body: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  imageId?: string;
}

const PageBreakParagraphs = styled.div`
  & {
    p {
      break-inside: avoid;
    }
  }
`;

const IdeaCard = ({ rank, title, body }: Props) => {
  return (
    <Box borderTop={BORDER} my="16px" pt="16px">
      <Box display="flex" flexDirection="row" justifyContent="flex-start">
        <Box
          bgColor={colors.grey200}
          px="8px"
          py="4px"
          borderRadius={stylingConsts.borderRadius}
          mr="8px"
          mt="-1px"
        >
          <Text
            mt="0px"
            mb="0px"
            color="textSecondary"
            fontSize="xs"
            fontWeight="bold"
          >
            #{rank}
          </Text>
        </Box>
        <Title variant="h4" display="inline" color="primary" mt="0px" mb="0px">
          {title}
        </Title>
      </Box>
      <Text fontSize="m" color="tenantText" mt="8px" mb="0px">
        <PageBreakParagraphs dangerouslySetInnerHTML={{ __html: body }} />
      </Text>
    </Box>
  );
};

export default IdeaCard;
