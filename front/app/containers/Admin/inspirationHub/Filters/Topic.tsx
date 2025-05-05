import React from 'react';

import useProjectLibraryTopics from 'api/project_library_topics/useProjectLibraryTopics';

import FilterSelector from 'components/FilterSelector';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';
import tracks from './tracks';

const Topic = () => {
  const values = useRansackParam('q[topic_id_in]');
  const { formatMessage } = useIntl();

  const { data: topics } = useProjectLibraryTopics();

  const options = topics?.data.map(({ id, attributes: { l1, l2 } }) => ({
    value: id,
    text: `${l1}: ${l2}`,
  }));

  return (
    <FilterSelector
      multipleSelectionAllowed
      selected={values ?? []}
      values={options ?? []}
      title={formatMessage(messages.topic)}
      name="topic-select"
      ml="0px"
      mr="0px"
      onChange={(topics) => {
        setRansackParam('q[topic_id_in]', topics);
        trackEventByName(tracks.setTopic, {
          country_codes: JSON.stringify(topics),
        });
      }}
    />
  );
};

export default Topic;
