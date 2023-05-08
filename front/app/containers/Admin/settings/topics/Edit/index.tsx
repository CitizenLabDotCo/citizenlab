import React from 'react';
import { useParams } from 'react-router-dom';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useTopic from 'api/topics/useTopic';

// services

// components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import TopicForm from '../TopicForm';

import useUpdateTopic from 'api/topics/useUpdateTopic';
import { ITopicUpdate } from 'api/topics/types';

// typings

const Edit = () => {
  const { topicId } = useParams() as { topicId: string };
  const { data: topic } = useTopic(topicId);
  const { mutate: updateTopic } = useUpdateTopic();

  const handleSubmit = (values: Omit<ITopicUpdate, 'id'>) => {
    if (!topic) return;

    updateTopic(
      {
        id: topic.data.id,
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
        <FormattedMessage {...messages.editTopicFormTitle} />
      </SectionTitle>
      {!isNilOrError(topic) && (
        <TopicForm
          defaultValues={{
            title_multiloc: topic.data.attributes.title_multiloc,
          }}
          onSubmit={handleSubmit}
        />
      )}
    </Section>
  );
};

export default Edit;
