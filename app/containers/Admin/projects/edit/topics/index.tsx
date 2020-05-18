import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

import { Section, SectionField, SectionTitle, SectionSubtitle } from 'components/admin/Section';
// import TopicSearch from './TopicSearch';
import TopicList from './TopicList';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useTopics from 'hooks/useTopics';

const Container = styled.div``;

const Topics = memo(() => {
  const topics = useTopics();
  const defaultTopics = !isNilOrError(topics) ? topics.filter(topic => !isNilOrError(topic) && true) : []; // TODO
  const selectableTopics = !isNilOrError(topics) && topics.filter(topic => !isNilOrError(topic) && !selectedTopics.includes(topic));
  const [selectedTopics, setSelectedTopics] = useState(defaultTopics);

  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.titleDescription} />
      </SectionTitle>
      <SectionSubtitle>
        <FormattedMessage {...messages.subtitleDescription} />
      </SectionSubtitle>
      <TopicSearch selectableTopics={selectableTopics} />
      <TopicList selectedTopics={selectedTopics} />
    </Container>
  );
});

export default Topics;
