import React from 'react';
import { createCampaign } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import GoBackButton from 'components/UI/GoBackButton';
import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

type Props = {
  authUser: GetAuthUserChildProps;
};

const New = (props: Props) => {
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
            (!isNilOrError(props.authUser) &&
              props.authUser.attributes.email) ||
            '',
          subject_multiloc: {},
          body_multiloc: {},
          group_ids: [],
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default () => (
  <GetAuthUser>
    {(user) => (isNilOrError(user) ? null : <New authUser={user} />)}
  </GetAuthUser>
);
