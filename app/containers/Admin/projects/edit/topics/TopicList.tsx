import React, { memo, FormEvent } from 'react';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// components
import Button from 'components/UI/Button';
import { List, SortableRow } from 'components/admin/ResourceList';

// hooks
import useTopics from 'hooks/useTopics';

interface Props {
  selectedTopicIds: string[];
  handleRemoveSelectedTopic: (topicId: string) => void;
}

const TopicList = memo(({ selectedTopicIds }: Props) => {

  const handleRemoveSelectedTopic = (topicId: string) => (event: FormEvent) => {
    event.preventDefault();

    this.props.handleRemoveSelectedTopic(topicId);
  };

  const selectedTopics = useTopics(selectedTopicIds);

  return (
    <List>
      {!isNilOrError(selectedTopics) && selectedTopics.map((topic, index) => {
        if (!isNilOrError(topic)) {
          return (
            <SortableRow
              key={topic.id}
              isLastItem={(index === selectedTopics.length - 1)}
            >
              <p className="expand">Topic</p>
              <Button
                onClick={handleRemoveSelectedTopic(topic.id)}
                buttonStyle="text"
                icon="delete"
              >
                <FormattedMessage {...messages.remove} />
              </Button>
            </SortableRow>
          );
        }

        return null;
      })
    }
    {/* {isError(moderators) &&
      <FormattedMessage {...messages.moderatorsNotFound} />
    } */}
  </List>
  );
});

const TopicListWithHOCs = injectIntl<Props>(TopicList);

export default TopicListWithHOCs;
