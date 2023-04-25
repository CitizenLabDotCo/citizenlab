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
import { updateTopic, ITopicUpdate } from 'services/topics';

// components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import TopicForm from '../TopicForm';

// typings

const Edit = () => {
  const { topicId } = useParams() as { topicId: string };
  const { data: topic } = useTopic(topicId);

  const handleSubmit = async (values: ITopicUpdate) => {
    if (!topic) return;

    await updateTopic(topic.data.id, {
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
