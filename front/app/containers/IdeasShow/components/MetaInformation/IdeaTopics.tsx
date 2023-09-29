import React from 'react';
import {
  Header,
  Item,
} from 'containers/IdeasShow/components/MetaInformation/MetaInfoStyles';
import Topics from 'components/PostShowComponents/Topics';
import useIdeaById from 'api/ideas/useIdeaById';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  ideaId: string;
  compact?: boolean;
  className?: string;
}

const IdeaTopics = ({ ideaId, compact, className }: Props) => {
  const { formatMessage } = useIntl();
  const { data: idea } = useIdeaById(ideaId);

  if (!isNilOrError(idea)) {
    const topicIds =
      idea.data.relationships.topics?.data.map((item) => item.id) || [];

    if (topicIds.length > 0) {
      return (
        <Item className={className || ''} compact={compact}>
          <Header>{formatMessage(messages.topics)}</Header>
          <Topics postType="idea" postTopicIds={topicIds} />
        </Item>
      );
    }
  }

  return null;
};

export default IdeaTopics;
