import React from 'react';

import { useParams } from 'react-router-dom';

import { ITopicUpdate } from 'api/topics/types';
import useTopic from 'api/topics/useTopic';
import useUpdateTopic from 'api/topics/useUpdateTopic';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';
import TopicForm from '../TopicForm';

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
            description_multiloc: topic.data.attributes.description_multiloc,
            default: topic.data.attributes.default,
          }}
          onSubmit={handleSubmit}
        />
      )}
    </Section>
  );
};

export default Edit;
