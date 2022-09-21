import React from 'react';
import { Header, Item } from 'components/IdeasShowComponents/MetaInfoStyles';
import Topics from 'components/PostShowComponents/Topics';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  ideaId: string;
  compact?: boolean;
  className?: string;
}

const IdeaTopics = ({
  ideaId,
  compact,
  className,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const topicIds =
      idea.relationships.topics?.data.map((item) => item.id) || [];

    if (topicIds.length > 0) {
      return (
        <Item className={className || ''} compact={compact}>
          <Header>{formatMessage(messages.topics)}</Header>
          <Topics postType="idea" topicIds={topicIds} />
        </Item>
      );
    }
  }

  return null;
};

export default injectIntl(IdeaTopics);
