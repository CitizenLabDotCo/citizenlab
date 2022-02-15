import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { isCLErrorJSON } from 'utils/errorUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useTopic from 'hooks/useTopic';

// services
import { updateTopic } from '../../../../services/topics';

// components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import { Formik } from 'formik';
import TopicForm from '../TopicForm';

// typings
import { CLErrorsJSON } from 'typings';
import { ITopicUpdate } from '../../../../services/topics';

const Edit = ({ params: { topicId } }: WithRouterProps) => {
  const topic = useTopic(topicId);

  const handleSubmit = async (
    values: ITopicUpdate,
    { setErrors, setSubmitting, setStatus }
  ) => {
    if (isNilOrError(topic)) return;

    try {
      await updateTopic(topic.id, {
        ...values,
      });
      clHistory.push('/admin/settings/topics');
    } catch (errorResponse) {
      if (isCLErrorJSON(errorResponse)) {
        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
      } else {
        setStatus('error');
      }

      setSubmitting(false);
    }
  };

  const renderFn = (props) => {
    return <TopicForm {...props} />;
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
        <Formik
          initialValues={{
            title_multiloc: topic.attributes.title_multiloc,
            description_multiloc: topic.attributes.description_multiloc,
          }}
          render={renderFn}
          onSubmit={handleSubmit}
        />
      )}
    </Section>
  );
};

export default withRouter(Edit);
