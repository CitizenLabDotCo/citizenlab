import React from 'react';

import { IGlobalTopicAdd } from 'api/global_topics/types';
import useAddGlobalTopic from 'api/global_topics/useAddGlobalTopic';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';
import TopicForm from '../TopicForm';

const New = () => {
  const { mutateAsync: addTopic } = useAddGlobalTopic();
  const handleSubmit = async (values: IGlobalTopicAdd) => {
    await addTopic({
      ...values,
    });
    clHistory.push('/admin/settings/topics/platform');
  };

  const goBack = () => {
    clHistory.push('/admin/settings/topics/platform');
  };

  return (
    <Section>
      <GoBackButton onClick={goBack} />
      <SectionTitle>
        <FormattedMessage {...messages.addTopicButton} />
      </SectionTitle>
      <TopicForm onSubmit={handleSubmit} />
    </Section>
  );
};

export default New;
