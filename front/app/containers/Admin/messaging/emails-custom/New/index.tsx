import * as React from 'react';
import { createCampaign } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import GoBackButton from 'components/UI/GoBackButton';
import CampaignForm, {
  FormValues,
  validateCampaignForm,
  PageTitle,
} from '../CampaignForm';
import { Formik } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { isCLErrorJSON } from 'utils/errorUtils';

type Props = {
  authUser: GetAuthUserChildProps;
};

class New extends React.Component<Props> {
  handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    createCampaign({
      campaign_name: 'manual',
      ...values,
    })
      .then((response) => {
        clHistory.push(`/admin/emails/custom/${response.data.id}`);
      })
      .catch((errorResponse) => {
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = errorResponse.json.errors;
          setErrors(apiErrors);
        }
        setStatus('error');
        setSubmitting(false);
      });
  };

  initialValues = (): FormValues => {
    const { authUser } = this.props;
    return {
      sender: 'author',
      reply_to: (!isNilOrError(authUser) && authUser.attributes.email) || '',
      subject_multiloc: {},
      body_multiloc: {},
      group_ids: [],
    };
  };

  renderFn = (props) => <CampaignForm {...props} mode="new" />;

  goBack = () => {
    clHistory.push('/admin/emails/custom');
  };

  render() {
    return (
      <div>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <FormattedMessage {...messages.addCampaignTitle} />
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

export default () => (
  <GetAuthUser>
    {(user) => (isNilOrError(user) ? null : <New authUser={user} />)}
  </GetAuthUser>
);
