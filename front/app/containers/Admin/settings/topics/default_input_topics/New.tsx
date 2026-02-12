import React from 'react';

import { useSearch } from '@tanstack/react-router';

import { IDefaultInputTopicAdd } from 'api/default_input_topics/types';
import useAddDefaultInputTopic from 'api/default_input_topics/useAddDefaultInputTopic';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import DefaultInputTopicForm from './DefaultInputTopicForm';
import messages from './messages';

const New = () => {
  const { parent_id: parentId } = useSearch({ strict: false });
  const { mutate: addDefaultInputTopic } = useAddDefaultInputTopic();

  const handleSubmit = async (values: IDefaultInputTopicAdd) => {
    addDefaultInputTopic(
      {
        ...values,
        parent_id: parentId || undefined,
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
        <FormattedMessage
          {...(parentId
            ? messages.addSubtopicButton
            : messages.addDefaultInputTopicButton)}
        />
      </SectionTitle>
      <DefaultInputTopicForm onSubmit={handleSubmit} />
    </Section>
  );
};

export default New;
