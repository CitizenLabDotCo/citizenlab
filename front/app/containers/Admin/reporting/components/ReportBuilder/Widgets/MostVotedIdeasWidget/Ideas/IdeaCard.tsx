import React, { useState, useRef, useEffect } from 'react';

// hooks
import useIdeaImages from 'hooks/useIdeaImages';

// styling
import styled from 'styled-components';
import { colors, stylingConsts, fontSizes } from 'utils/styleUtils';
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
import checkTextOverflow, { MEDIUM_LINE_HEIGHT } from './checkTextOverflow';

interface Props {
  rank: number;
  title: string;
  body: string;
  url: string;
  id: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  collapseLongText: boolean;
}

const OverflowContainer = styled.div<{ hideTextOverflow: boolean }>`
  ${({ hideTextOverflow }) => {
    if (!hideTextOverflow) return '';

    return `
      overflow: hidden;
      height: calc(${MEDIUM_LINE_HEIGHT * 8}px);

      &:after {
        content: "";
        text-align: right;
        position: absolute;
        bottom: ${MEDIUM_LINE_HEIGHT * 3}px;
        right: 0;
        width: 100%;
        height: ${MEDIUM_LINE_HEIGHT * 2}px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 100%);
      }
    `;
  }}
`;

const IdeaText = styled.div`
  margin-top: 8px;
  & {
    p {
      break-inside: avoid;
      font-size: ${fontSizes.m};
      color: ${colors.primary};
      line-height: ${MEDIUM_LINE_HEIGHT}px;
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
  collapseLongText,
}: Props) => {
  const overflowContainerRef = useRef(null);
  const [textOverflow, setTextOverflow] = useState(false);
  const images = useIdeaImages(id);
  const image = isNilOrError(images)
    ? undefined
    : images[0]?.attributes?.versions?.medium;

  useEffect(() => {
    if (collapseLongText === false) return;
    setTextOverflow(false);

    setTimeout(() => {
      setTextOverflow(!!checkTextOverflow(overflowContainerRef));
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overflowContainerRef, collapseLongText]);

  return (
    <Box borderTop={BORDER} my="16px" pt="16px">
      <PageBreakBox
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
      >
        <Box
          // hack to make backgrounds work in print view
          boxShadow={`inset 0 0 0 1000px ${colors.grey200}`}
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
      <OverflowContainer
        hideTextOverflow={textOverflow && collapseLongText}
        ref={overflowContainerRef}
      >
        {image && (
          <PageBreakBox
            mt="8px"
            display="flex"
            flexDirection="row"
            justifyContent="center"
          >
            <Image src={image} alt="" width="50%" />
          </PageBreakBox>
        )}
        <IdeaText dangerouslySetInnerHTML={{ __html: body }} />
      </OverflowContainer>
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
