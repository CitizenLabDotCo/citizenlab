import { defineMessages } from 'react-intl';

export default defineMessages({
  selectedTopics: {
    id: 'app.components.TopicsPicker.numberOfSelectedTopics',
    defaultMessage:
      'Selected {numberOfSelectedTopics, plural, =0 {zero topics} one {one topic} other {# topics}}. {selectedTopicNames}',
  },
});
