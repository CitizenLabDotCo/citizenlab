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
import { isCLErrorJSON } from 'utils/errorUtils';
import useAuthUser from 'hooks/useAuthUser';

const New = () => {
  const authUser = useAuthUser();

  const handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    createCampaign({
      campaign_name: 'manual',
      ...values,
    })
      .then((response) => {
        clHistory.push(`/admin/messaging/emails/custom/${response.data.id}`);
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

  const initialValues = (): FormValues => {
    return {
      sender: 'author',
      reply_to: (!isNilOrError(authUser) && authUser.attributes.email) || '',
      subject_multiloc: {},
      body_multiloc: {},
      group_ids: [],
    };
  };

  const renderFn = () => <CampaignForm mode="new" />;

  const goBack = () => {
    clHistory.push('/admin/messaging/emails/custom');
  };

  return (
    <div>
      <GoBackButton onClick={goBack} />
      <PageTitle>
        <FormattedMessage {...messages.addCampaignTitle} />
      </PageTitle>
      <Formik
        initialValues={initialValues()}
        onSubmit={handleSubmit}
        render={renderFn}
        validate={validateCampaignForm}
      />
    </div>
  );
};

export default New;
