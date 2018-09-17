import * as React from 'react';
import styled from 'styled-components';
import { createCampaign } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import CampaignForm, { FormValues, validateCampaignForm } from '../CampaignForm';
import { Formik } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

type Props = {};

class New extends React.Component<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    createCampaign({
      ...values
    })
      .then((response) => {
        clHistory.push(`/admin/campaigns/${response.data.id}`);
      })
      .catch((errorResponse) => {
        const apiErrors = errorResponse.json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  initialValues = () : FormValues => {
    return {
      sender: 'author',
      reply_to: 'author',
      subject_multiloc: {},
      body_multiloc: {},
      group_ids: [],
    };
  }

  renderFn = (props) => (
    <CampaignForm
      {...props}
      mode="new"
    />
  )

  goBack = () => {
    clHistory.push('/admin/campaigns');
  }

  render() {
    return (
      <div>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <FormattedMessage {...messages.addCampaignTitle} />
        </PageTitle>
        <PageWrapper>
          <Formik
            initialValues={this.initialValues()}
            onSubmit={this.handleSubmit}
            render={this.renderFn}
            validate={validateCampaignForm}
          />
        </PageWrapper>
      </div>
    );
  }
}

export default New;
