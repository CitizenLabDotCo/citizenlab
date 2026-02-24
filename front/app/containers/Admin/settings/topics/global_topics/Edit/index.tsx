import React from 'react';

import { useParams } from 'utils/router';

import { IGlobalTopicUpdate } from 'api/global_topics/types';
import useGlobalTopic from 'api/global_topics/useGlobalTopic';
import useUpdateGlobalTopic from 'api/global_topics/useUpdateGlobalTopic';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';
import TopicForm from '../TopicForm';

const Edit = () => {
  const { topicId } = useParams({ strict: false }) as { topicId: string };
  const { data: topic } = useGlobalTopic(topicId);
  const { mutate: updateTopic } = useUpdateGlobalTopic();

  const handleSubmit = (values: Omit<IGlobalTopicUpdate, 'id'>) => {
    if (!topic) return;

    updateTopic(
      {
        id: topic.data.id,
        ...values,
      },
      {
        onSuccess: () => {
          clHistory.push('/admin/settings/topics/platform');
        },
      }
    );
  };

  const goBack = () => {
    clHistory.push('/admin/settings/topics/platform');
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
          }}
          onSubmit={handleSubmit}
        />
      )}
    </Section>
  );
};

export default Edit;
