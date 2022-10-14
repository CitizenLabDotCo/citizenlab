import React from 'react';

import useAuthUser from 'hooks/useAuthUser';
import { createCampaign } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import GoBackButton from 'components/UI/GoBackButton';
import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const New = () => {
  const authUser = useAuthUser();
  const handleSubmit = async (values: FormValues) => {
    const response = await createCampaign({
      campaign_name: 'manual',
      ...values,
    });

    clHistory.push(`/admin/messaging/emails/custom/${response.data.id}`);
  };

  const goBack = () => {
    clHistory.push('/admin/messaging/emails/custom');
  };

  return (
    <div>
      <GoBackButton onClick={goBack} />
      <PageTitle>
        <FormattedMessage {...messages.addCampaignTitle} />
      </PageTitle>
      <CampaignForm
        defaultValues={{
          sender: 'author',
          reply_to:
            (!isNilOrError(authUser) && authUser.attributes.email) || '',
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default New;
