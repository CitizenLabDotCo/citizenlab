import * as React from 'react';
import styled from 'styled-components';
import { updateCampaign, ICampaignData } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import CampaignForm, { FormValues, validateCampaignForm } from '../CampaignForm';
import { Formik } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { withRouter, WithRouterProps } from 'react-router';
import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

interface InputProps {}

interface DataProps {
  campaign: ICampaignData;
}

interface Props extends InputProps, DataProps, WithRouterProps { }

class Edit extends React.Component<Props> {

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    updateCampaign(this.props.campaign.id, {
      ...values
    })
      .then(() => {
        clHistory.push(`/admin/emails/manual/${this.props.campaign.id}`);
      })
      .catch((errorResponse) => {
        const apiErrors = errorResponse.json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  initialValues = () : FormValues => {
    const { campaign } = this.props;
    return {
      sender: campaign.attributes.sender,
      reply_to: campaign.attributes.reply_to,
      subject_multiloc: campaign.attributes.subject_multiloc,
      body_multiloc: campaign.attributes.body_multiloc,
      group_ids: campaign.relationships.groups.data.map(d => d.id),
    };
  }

  renderFn = (props) => (
    <CampaignForm
      {...props}
      mode="edit"
    />
  )

  goBack = () => {
    const { id } = this.props.campaign;
    clHistory.push(`/admin/emails/manual/${id}`);
  }

  render() {
    return (
      <div>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <FormattedMessage {...messages.editCampaignTitle} />
        </PageTitle>
        <Formik
          initialValues={this.initialValues()}
          onSubmit={this.handleSubmit}
          render={this.renderFn}
          validate={validateCampaignForm}
        />
      </div>
    );
  }
}

const EditWithHOCs = withRouter(Edit);

export default (inputProps: InputProps & WithRouterProps) => (
  <GetCampaign id={inputProps.params.campaignId}>
    {campaign => isNilOrError(campaign) ? null : <EditWithHOCs {...inputProps} campaign={campaign} />}
  </GetCampaign>
);
