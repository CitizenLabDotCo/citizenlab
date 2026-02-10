import React from 'react';

import { useParams } from 'utils/router';

import { IDefaultInputTopicUpdate } from 'api/default_input_topics/types';
import useDefaultInputTopic from 'api/default_input_topics/useDefaultInputTopic';
import useUpdateDefaultInputTopic from 'api/default_input_topics/useUpdateDefaultInputTopic';

import { Section, SectionTitle } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import DefaultInputTopicForm from './DefaultInputTopicForm';
import messages from './messages';

const Edit = () => {
  const { defaultInputTopicId } = useParams({ strict: false }) as {
    defaultInputTopicId: string;
  };
  const { data: topic } = useDefaultInputTopic(defaultInputTopicId);
  const { mutate: updateDefaultInputTopic } = useUpdateDefaultInputTopic();

  const handleSubmit = (values: Omit<IDefaultInputTopicUpdate, 'id'>) => {
    if (!topic) return;

    updateDefaultInputTopic(
      {
        id: topic.data.id,
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
        <FormattedMessage {...messages.editDefaultInputTopicFormTitle} />
      </SectionTitle>
      {!isNilOrError(topic) && (
        <DefaultInputTopicForm
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
