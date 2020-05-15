import React, { memo } from 'react';
import styled from 'styled-components';

import { Section, SectionField, SectionTitle, SectionSubtitle } from 'components/admin/Section';
import TopicSearch from './TopicSearch';
import TopicList from './TopicList';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div``;

const Topics = memo(() => {
  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.titleDescription} />
      </SectionTitle>
      <SectionSubtitle>
        <FormattedMessage {...messages.subtitleDescription} />
      </SectionSubtitle>
      <TopicSearch />
      <TopicList />
    </Container>

  );
});

export default Topics;
