import React from 'react';

import {
  Box,
  Text,
  Icon,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';

import useIdeaById from 'api/ideas/useIdeaById';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import tracks from './tracks';

interface IdeaDetailViewProps {
  ideaId: string | null;
}

const IdeaDetailView = ({ ideaId }: IdeaDetailViewProps) => {
  const { data: idea, isLoading } = useIdeaById(ideaId ? ideaId : undefined);
  const { formatMessage } = useIntl();

  if (isLoading) return <Spinner />;

  if (!idea) {
    return null;
  }

  const {
    title_multiloc,
    author_name,
    body_multiloc,
    likes_count,
    dislikes_count,
    comments_count,
  } = idea.data.attributes;

  return (
    <Box p="16px 24px">
      <Box display="flex" alignItems="center" gap="8px">
        <Icon
          name="user-circle"
          width="16px"
          height="16px"
          fill={colors.black}
        />
        <Text variant="bodyS" color="grey700" my="0px">
          {author_name}
        </Text>
        <Box flex="1" />
        <Box display="flex" gap="16px">
          <Box display="flex" alignItems="center" gap="4px">
            <Icon
              name="thumb-up"
              width="16px"
              height="16px"
              fill={colors.grey700}
            />
            <Text variant="bodyS">{likes_count}</Text>
          </Box>
          <Box display="flex" alignItems="center" gap="4px">
            <Icon
              name="thumb-down"
              width="16px"
              height="16px"
              fill={colors.grey700}
            />
            <Text variant="bodyS">{dislikes_count}</Text>
          </Box>
          <Box display="flex" alignItems="center" gap="4px">
            <Icon
              name="chat-bubble"
              width="16px"
              height="16px"
              fill={colors.grey700}
            />
            <Text variant="bodyS">{comments_count}</Text>
          </Box>
        </Box>
      </Box>

      <Text
        variant="bodyL"
        fontWeight="bold"
        color="textPrimary"
        mt="0px"
        mb="8px"
      >
        <T value={title_multiloc} />
      </Text>

      <QuillEditedContent>
        <T value={body_multiloc} supportHtml />
      </QuillEditedContent>
      <Box mt="24px" w="100%" display="flex">
        <ButtonWithLink
          width="100%"
          buttonStyle="primary"
          linkTo={`/ideas/${idea.data.attributes.slug}`}
          bgColor={colors.primary}
          onClick={() => {
            trackEventByName(tracks.clickedSimilarInputFromSuggestions);
            window.open(`/ideas/${idea.data.attributes.slug}`, '_blank');
          }}
          openLinkInNewTab
        >
          {formatMessage(messages.engageHere)}
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default IdeaDetailView;
