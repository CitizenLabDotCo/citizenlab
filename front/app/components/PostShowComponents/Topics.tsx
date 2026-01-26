import React, { memo } from 'react';

import {
  Box,
  Title,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';
import styled, { useTheme } from 'styled-components';

import useInputTopicById from 'api/input_topics/useInputTopicById';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Topic = styled.div`
  color: ${({ theme }) => theme.colors.tenantSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  padding: 6px 12px;
  margin-right: 5px;
  margin-bottom: 5px;
  border: 1px solid
    ${({ theme }) => transparentize(0.7, theme.colors.tenantSecondary)};
  border-radius: ${(props) => props.theme.borderRadius};

  ${isRtl`
    margin-right: 0;
    margin-left: 5px;
  `}
`;

interface Props {
  postTopicIds: string[];
  className?: string;
  showTitle?: boolean;
}

const Topics = memo(({ postTopicIds, className, showTitle }: Props) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  return (
    <Box display="flex" flexDirection="column">
      {showTitle && (
        <Title variant="h3">{formatMessage(messages.topics)}</Title>
      )}
      <Box
        id={`e2e-idea-topics`}
        className={className}
        display="flex"
        flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
        flexWrap="wrap"
      >
        {postTopicIds.map((topicId: string) => {
          return <TopicComponent key={topicId} topicId={topicId} />;
        })}
      </Box>
    </Box>
  );
});

const TopicComponent = ({ topicId }: { topicId: string }) => {
  const { data: topic } = useInputTopicById(topicId);
  const localize = useLocalize();

  if (!topic) return null;

  return (
    <Topic className={`e2e-idea-topic`}>
      {localize(topic.data.attributes.full_title_multiloc)}
    </Topic>
  );
};

export default Topics;
