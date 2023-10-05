import React, { memo } from 'react';

// styling
import styled, { useTheme } from 'styled-components';
import { fontSizes, isRtl } from 'utils/styleUtils';
import { transparentize } from 'polished';

// hooks
import useLocalize from 'hooks/useLocalize';
import useTopic from 'api/topics/useTopic';
import { useIntl } from 'utils/cl-intl';

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
  postTopicIds: string[];
  className?: string;
  postType: 'idea' | 'initiative';
  showTitle?: boolean;
}

const Topics = memo(
  ({ postTopicIds, className, postType, showTitle }: Props) => {
    const { formatMessage } = useIntl();
    const theme = useTheme();
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
          {postTopicIds.map((topicId: string) => {
            return (
              <TopicComponent
                key={topicId}
                topicId={topicId}
                postType={postType}
              />
            );
          })}
        </Box>
      </Box>
    );
  }
);

const TopicComponent = ({
  topicId,
  postType,
}: {
  topicId: string;
  postType: 'idea' | 'initiative';
}) => {
  const { data: topic } = useTopic(topicId);
  const localize = useLocalize();

  if (!topic) return null;

  return (
    <Topic className={`e2e-${postType}-topic`}>
      {localize(topic.data.attributes.title_multiloc)}
    </Topic>
  );
};

export default Topics;
