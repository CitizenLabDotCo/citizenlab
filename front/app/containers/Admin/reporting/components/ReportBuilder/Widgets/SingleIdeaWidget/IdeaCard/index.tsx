import React, { useState, useRef, useEffect } from 'react';

import {
  colors,
  stylingConsts,
  Box,
  Text,
  Title,
  Image,
  Icon,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import styled from 'styled-components';

import { IIdeaImageData } from 'api/idea_images/types';
import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import QuillEditedContent from 'components/UI/QuillEditedContent';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { getTextNumberOfVotes } from 'utils/configs/votingMethodConfig/textNumberOfVotes';

import messages from '../../MostReactedIdeasWidget/messages';

import AuthorAvatar from './AuthorAvatar';
import checkTextOverflow, { MEDIUM_LINE_HEIGHT } from './checkTextOverflow';
import GradientSrc from './gradient.svg';

interface Props {
  rank?: number;
  idea: IIdeaData;
  images: IIdeaImageData[];
  phase: IPhaseData;
  collapseLongText: boolean;
  showAuthor?: boolean;
  showContent?: boolean;
  showReactions?: boolean;
  showVotes?: boolean;
}

const IdeaText = styled.div`
  line-height: ${MEDIUM_LINE_HEIGHT}px;
`;

const IdeaCard = ({
  rank,
  idea,
  images,
  phase,
  collapseLongText,
  showAuthor = false,
  showContent = true,
  showReactions = false,
  showVotes = false,
}: Props) => {
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const [textOverflow, setTextOverflow] = useState(false);
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const title = localize(idea.attributes.title_multiloc);
  const body = localize(idea.attributes.body_multiloc);
  const url: RouteType = `/ideas/${idea.attributes.slug}`;
  const likes = idea.attributes.likes_count;
  const dislikes = idea.attributes.dislikes_count;
  const image = images[0]?.attributes?.versions?.medium;

  useEffect(() => {
    if (!textContainerRef.current) return;
    setTextOverflow(checkTextOverflow(textContainerRef.current));
  }, []);

  const textNumberOfVotes = getTextNumberOfVotes({
    numberOfVotes: idea.attributes.votes_count,
    phase,
    localize,
    formatMessage,
  });

  const hideTextOverflow = collapseLongText && textOverflow;

  return (
    <Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        className="e2e-report-builder-idea-card"
      >
        {rank && (
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
        )}
        <Link to={url} target="_blank">
          <Title styleVariant="h5" display="inline" mt="0px" mb="0px">
            {title}
          </Title>
        </Link>
      </Box>
      {showContent && (
        <Box>
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
              height={
                hideTextOverflow ? `${MEDIUM_LINE_HEIGHT * 8}px` : undefined
              }
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
                <QuillEditedContent textColor={colors.textPrimary} fontSize="m">
                  <IdeaText
                    dangerouslySetInnerHTML={{ __html: body }}
                    ref={textContainerRef}
                  />
                </QuillEditedContent>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
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
      <Box display="flex" {...(showAuthor ? { pt: '8px' } : {})}>
        {showAuthor && <AuthorAvatar idea={idea} />}
        <Box marginLeft="auto">
          <Text color="coolGrey500" fontSize="s">
            {showVotes && (
              <Box as="span" display="inline" mr="10px">
                {textNumberOfVotes}
              </Box>
            )}
            {showReactions && (
              <Box as="span" display="inline">
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
              </Box>
            )}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default IdeaCard;
