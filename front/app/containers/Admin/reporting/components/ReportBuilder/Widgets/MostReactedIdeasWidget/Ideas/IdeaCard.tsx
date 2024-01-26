import React, { useState, useRef, useEffect } from 'react';

// styling
import styled, { useTheme } from 'styled-components';
import {
  colors,
  stylingConsts,
  Box,
  Text,
  Title,
  Image,
  Icon,
} from '@citizenlab/cl2-component-library';
import { BORDER } from '../../constants';

// components
import Link from 'utils/cl-router/Link';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import GradientSrc from './gradient.svg';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import checkTextOverflow, { MEDIUM_LINE_HEIGHT } from './checkTextOverflow';

// types
import { IIdeaImageData } from 'api/idea_images/types';

interface Props {
  rank: number;
  title: string;
  body: string;
  url: string;
  images: IIdeaImageData[];
  likes: number;
  dislikes: number;
  comments: number;
  collapseLongText: boolean;
}

const IdeaText = styled.div`
  line-height: ${MEDIUM_LINE_HEIGHT}px;
`;

const IdeaCard = ({
  rank,
  title,
  body,
  url,
  images,
  likes,
  dislikes,
  comments,
  collapseLongText,
}: Props) => {
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const [textOverflow, setTextOverflow] = useState(false);
  const theme = useTheme();

  const image = images[0]?.attributes?.versions?.medium;

  useEffect(() => {
    if (!textContainerRef.current) return;
    setTextOverflow(checkTextOverflow(textContainerRef.current));
  }, []);

  const hideTextOverflow = collapseLongText && textOverflow;

  return (
    <PageBreakBox borderTop={BORDER} my="16px" pt="16px">
      <Box display="flex" flexDirection="row" justifyContent="flex-start">
        <Box
          // hack to make backgrounds work in print view
          boxShadow={`inset 0 0 0 1000px ${colors.grey200}`}
          px="8px"
          py="4px"
          borderRadius={stylingConsts.borderRadius}
          mr="8px"
          mt="-1px"
          height="26px"
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
      </Box>
      {image && (
        <Box
          mt="8px"
          display="flex"
          flexDirection="row"
          justifyContent="center"
        >
          <Image src={image} alt="" width="50%" />
        </Box>
      )}
      <Box width="100%">
        <Box
          height={hideTextOverflow ? `${MEDIUM_LINE_HEIGHT * 8}px` : undefined}
          overflow={hideTextOverflow ? 'hidden' : undefined}
        >
          <Box
            display={hideTextOverflow ? 'block' : 'none'}
            position="absolute"
            mt={`${MEDIUM_LINE_HEIGHT * 6}px`}
            height={`${MEDIUM_LINE_HEIGHT * 2}px`}
            width={`${textContainerRef.current?.clientWidth ?? 0}px`}
          >
            <Image src={GradientSrc} alt="" width="100%" height="100%" />
          </Box>
          <Box mt="12px">
            <QuillEditedContent
              textColor={theme.colors.tenantText}
              fontSize="m"
            >
              <IdeaText
                dangerouslySetInnerHTML={{ __html: body }}
                ref={textContainerRef}
              />
            </QuillEditedContent>
          </Box>
        </Box>
      </Box>
      {hideTextOverflow && (
        <Link to={url} target="_blank">
          <Text
            fontSize="s"
            color="coolGrey500"
            textDecoration="underline"
            fontWeight="bold"
          >
            <FormattedMessage {...messages.showMore} />
          </Text>
        </Link>
      )}
      <Box>
        <Text color="coolGrey500" fontSize="s">
          <Icon
            height="16px"
            fill={colors.coolGrey500}
            mr="3px"
            name="vote-up"
          />
          {likes}
          <Icon
            height="16px"
            fill={colors.coolGrey500}
            ml="8px"
            mr="3px"
            name="vote-down"
          />
          {dislikes}
          <Icon
            height="16px"
            fill={colors.coolGrey500}
            ml="8px"
            mr="3px"
            name="comments"
          />
          {comments}
        </Text>
      </Box>
    </PageBreakBox>
  );
};

export default IdeaCard;
