import React, { memo } from 'react';

// hooks
import useTopics from 'api/topics/useTopics';
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';

// styling
import styled, { useTheme } from 'styled-components';
import { fontSizes, isRtl } from 'utils/styleUtils';
import { transparentize } from 'polished';

// typings
import { ITopicData } from 'api/topics/types';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';

// i18n
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
  topicIds: string[];
  className?: string;
  postType: 'idea' | 'initiative';
  showTitle?: boolean;
}

const Topics = memo<Props>(({ topicIds, className, postType, showTitle }) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const { data: topics } = useTopics();
  const filteredTopics =
    topics?.data.filter((topic) => topicIds.includes(topic.id)) || [];

  if (!topics || filteredTopics.length === 0) return null;

  return (
    <Box display="flex" flexDirection="column">
      {showTitle && (
        <Title variant="h3">{formatMessage(messages.topics)}</Title>
      )}
      <Box
        id={`e2e-${postType}-topics`}
        className={className}
        display="flex"
        flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
        flexWrap="wrap"
      >
        {filteredTopics.map((topic: ITopicData) => {
          return (
            <Topic key={topic.id} className={`e2e-${postType}-topic`}>
              {localize(topic.attributes.title_multiloc)}
            </Topic>
          );
        })}
      </Box>
    </Box>
  );
});

export default Topics;
