import React from 'react';

// hooks
import useIdeaImages from 'hooks/useIdeaImages';

// styling
import styled from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';
import { BORDER } from '../../constants';

// components
import {
  Box,
  Text,
  Title,
  Image,
  Icon,
} from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  rank: number;
  title: string;
  body: string;
  url: string;
  id: string;
  upvotes: number;
  downvotes: number;
  comments: number;
}

const PageBreakParagraphs = styled.div`
  & {
    p {
      break-inside: avoid;
    }
  }
`;

const IdeaCard = ({
  rank,
  title,
  body,
  url,
  id,
  upvotes,
  downvotes,
  comments,
}: Props) => {
  const images = useIdeaImages(id);
  const image = isNilOrError(images)
    ? undefined
    : images[0]?.attributes?.versions?.medium;

  return (
    <Box borderTop={BORDER} my="16px" pt="16px">
      <PageBreakBox
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
      >
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
        <Link to={url} target="_blank">
          <Title
            variant="h4"
            display="inline"
            color="primary"
            mt="0px"
            mb="0px"
          >
            {title}
          </Title>
        </Link>
      </PageBreakBox>
      {image && (
        <PageBreakBox mt="8px">
          <Image src={image} alt="" width="100%" />
        </PageBreakBox>
      )}
      <Text fontSize="m" color="tenantText" mt="8px" mb="0px">
        <PageBreakParagraphs dangerouslySetInnerHTML={{ __html: body }} />
      </Text>
      <PageBreakBox>
        <Text color="coolGrey500" fontSize="s">
          <Icon
            height="16px"
            fill={colors.coolGrey500}
            mr="3px"
            name="vote-up"
          />
          {upvotes}
          <Icon
            height="16px"
            fill={colors.coolGrey500}
            ml="8px"
            mr="3px"
            name="vote-down"
          />
          {downvotes}
          <Icon
            height="16px"
            fill={colors.coolGrey500}
            ml="8px"
            mr="3px"
            name="comments"
          />
          {comments}
        </Text>
      </PageBreakBox>
    </Box>
  );
};

export default IdeaCard;
