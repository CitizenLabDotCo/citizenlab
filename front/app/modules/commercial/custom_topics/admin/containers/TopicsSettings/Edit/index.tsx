import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { isCLErrorJSON } from 'utils/errorUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// resources
import GetTopic, { GetTopicChildProps } from 'resources/GetTopic';

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

interface InputProps {}
interface DataProps {
  topic: GetTopicChildProps;
}

interface Props extends InputProps, DataProps {}

class Edit extends React.PureComponent<Props> {
  handleSubmit = (
    values: ITopicUpdate,
    { setErrors, setSubmitting, setStatus }
  ) => {
    const { topic } = this.props;

    if (isNilOrError(topic)) return;

    updateTopic(topic.id, {
      ...values,
    })
      .then(() => {
        clHistory.push('/admin/settings/topics');
      })
      .catch((errorResponse) => {
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
          setErrors(apiErrors);
        } else {
          setStatus('error');
        }
        setSubmitting(false);
      });
  };

  renderFn = (props) => {
    return <TopicForm {...props} />;
  };

  goBack = () => {
    clHistory.push('/admin/settings/topics');
  };

  render() {
    const { topic } = this.props;
    return (
      <Section>
        <GoBackButton onClick={this.goBack} />
        <SectionTitle>
          <FormattedMessage {...messages.editTopicFormTitle} />
        </SectionTitle>
        {!isNilOrError(topic) && (
          <Formik
            initialValues={{
              title_multiloc: topic.attributes.title_multiloc,
              description_multiloc: topic.attributes.description_multiloc,
            }}
            render={this.renderFn}
            onSubmit={this.handleSubmit}
          />
        )}
      </Section>
    );
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetTopic id={inputProps.params.topicId}>
    {(topic) => <Edit topic={topic} />}
  </GetTopic>
));
