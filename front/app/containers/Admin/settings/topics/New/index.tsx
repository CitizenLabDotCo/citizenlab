import React from 'react';

import { ITopicAdd } from 'api/topics/types';
import useAddTopic from 'api/topics/useAddTopic';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';
import TopicForm from '../TopicForm';

const New = () => {
  const { mutate: addTopic } = useAddTopic();
  const handleSubmit = async (values: ITopicAdd) => {
    addTopic(
      {
        ...values,
      },
      {
        onSuccess: () => {
          clHistory.push('/admin/settings/topics');
        },
      }
    );
  };

  const goBack = () => {
    clHistory.push('/admin/settings/topics');
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
