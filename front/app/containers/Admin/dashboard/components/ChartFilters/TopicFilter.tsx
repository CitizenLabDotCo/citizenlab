import React from 'react';

// resources
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// hooks
import useLocalize, { Localize } from 'hooks/useLocalize';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// typings
import { IOption } from 'typings';
import { ITopicData } from 'services/topics';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  topics: GetTopicsChildProps;
}

interface InputProps {
  width?: string;
  currentTopicFilter?: string | null;
  onTopicFilter: (filter: IOption) => void;
}

interface Props extends DataProps, InputProps {}

const generateTopicOptions = (
  topics: ITopicData[],
  localize: Localize,
  formatMessage: InjectedIntlProps['intl']['formatMessage']
) => {
  const topicOptions = topics.map((topic) => ({
    value: topic.id,
    label: localize(topic.attributes.title_multiloc),
  }));

  return [
    { value: '', label: formatMessage(messages.allTopics) },
    ...topicOptions,
  ];
};

const TopicFilter = ({
  topics,
  width,
  currentTopicFilter,
  onTopicFilter,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const localize = useLocalize();

  if (isNilOrError(topics)) return null;

  const topicFilterOptions = generateTopicOptions(
    topics,
    localize,
    formatMessage
  );

  return (
    <Box width={width || '32%'}>
      <Select
        id="topicFilter"
        label={<FormattedMessage {...messages.labelTopicFilter} />}
        onChange={onTopicFilter}
        value={currentTopicFilter || ''}
        options={topicFilterOptions}
      />
    </Box>
  );
};

const GroupFilterWithIntl = injectIntl(TopicFilter);

export default (props: InputProps) => (
  <GetTopics>
    {(topics) => <GroupFilterWithIntl topics={topics} {...props} />}
  </GetTopics>
);
