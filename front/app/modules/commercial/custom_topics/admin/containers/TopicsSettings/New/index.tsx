import React, { useState } from 'react';
import clHistory from 'utils/cl-router/history';
import { CLErrors, CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';
import { addTopic } from 'services/topics';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import TopicForm, { IFormValues } from '../TopicForm';

interface Props {}

const NewTopicForm = (_props: Props) => {
  const [apiErrors, setApiErrors] = useState<CLErrors | undefined>(undefined);

  const handleSubmit = (formValues: IFormValues) => {
    addTopic({
      ...formValues,
    })
      .then(() => {
        clHistory.push('/admin/settings/topics');
      })
      .catch((errorResponse) => {
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
          setApiErrors(apiErrors);
        }
      });
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
      <TopicForm handleOnSubmit={handleSubmit} apiErrors={apiErrors} />
    </Section>
  );
};

export default NewTopicForm;
