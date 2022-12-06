import React from 'react';
// services
import { addTopic, ITopicUpdate } from '../../../../services/topics';
// intl
import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
// components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import TopicForm from '../TopicForm';
import messages from '../messages';

const New = () => {
  const handleSubmit = async (values: ITopicUpdate) => {
    await addTopic({
      ...values,
    });

    clHistory.push('/admin/settings/topics');
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
