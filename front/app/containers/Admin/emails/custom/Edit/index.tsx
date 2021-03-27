import * as React from 'react';
import { updateCampaign, ICampaignData } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import CampaignForm, {
  FormValues,
  validateCampaignForm,
  PageTitle,
} from '../CampaignForm';
import { Formik } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { withRouter, WithRouterProps } from 'react-router';
import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

interface InputProps {}

interface DataProps {
  campaign: ICampaignData;
}

interface Props extends InputProps, DataProps, WithRouterProps {}

class Edit extends React.Component<Props> {
  handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    updateCampaign(this.props.campaign.id, {
      ...values,
    })
      .then(() => {
        clHistory.push(`/admin/emails/custom/${this.props.campaign.id}`);
      })
      .catch((errorResponse) => {
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = errorResponse.json.errors;
          setErrors(apiErrors);
        } else {
          setStatus('error');
        }
        setSubmitting(false);
      });
  };

  initialValues = (): FormValues => {
    const { campaign } = this.props;
    return {
      sender: campaign.attributes.sender,
      reply_to: campaign.attributes.reply_to,
      subject_multiloc: campaign.attributes.subject_multiloc,
      body_multiloc: campaign.attributes.body_multiloc,
      group_ids: campaign.relationships.groups.data.map((d) => d.id),
    };
  };

  renderFn = (props) => {
    return <CampaignForm {...props} mode="edit" />;
  };

  goBack = () => {
    const { id } = this.props.campaign;
    clHistory.push(`/admin/emails/custom/${id}`);
  };

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
    {(campaign) =>
      isNilOrError(campaign) ? null : (
        <EditWithHOCs {...inputProps} campaign={campaign} />
      )
    }
  </GetCampaign>
);
