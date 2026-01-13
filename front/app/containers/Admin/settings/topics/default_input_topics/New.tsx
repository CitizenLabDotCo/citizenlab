import React from 'react';

import { IDefaultInputTopicAdd } from 'api/default_input_topics/types';
import useAddDefaultInputTopic from 'api/default_input_topics/useAddDefaultInputTopic';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import DefaultInputTopicForm from './DefaultInputTopicForm';
import messages from './messages';

const New = () => {
  const { mutate: addDefaultInputTopic } = useAddDefaultInputTopic();

  const handleSubmit = async (values: IDefaultInputTopicAdd) => {
    addDefaultInputTopic(
      {
        ...values,
      },
      {
        onSuccess: () => {
          clHistory.push('/admin/settings/topics/input');
        },
      }
    );
  };

  const goBack = () => {
    clHistory.push('/admin/settings/topics/input');
  };

  return (
    <Section>
      <GoBackButton onClick={goBack} />
      <SectionTitle>
        <FormattedMessage {...messages.addDefaultInputTopicButton} />
      </SectionTitle>
      <DefaultInputTopicForm onSubmit={handleSubmit} />
    </Section>
  );
};

export default New;
