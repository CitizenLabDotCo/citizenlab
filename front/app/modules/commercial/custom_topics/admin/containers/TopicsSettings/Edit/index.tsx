import React from 'react';
import { useParams } from 'react-router-dom';
// hooks
import useTopic from 'hooks/useTopic';
// services
import { updateTopic, ITopicUpdate } from '../../../../services/topics';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
// utils
import { isNilOrError } from 'utils/helperUtils';
// components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import TopicForm from '../TopicForm';
import messages from '../messages';

// typings

const Edit = () => {
  const { topicId } = useParams() as { topicId: string };
  const topic = useTopic(topicId);

  const handleSubmit = async (values: ITopicUpdate) => {
    if (isNilOrError(topic)) return;

    await updateTopic(topic.id, {
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
            title_multiloc: topic.attributes.title_multiloc,
          }}
          onSubmit={handleSubmit}
        />
      )}
    </Section>
  );
};

export default Edit;
