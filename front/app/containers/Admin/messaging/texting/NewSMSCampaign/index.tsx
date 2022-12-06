import React from 'react';
// utils
import clHistory from 'utils/cl-router/history';
import SMSCampaignForm from '../components/SMSCampaignForm';
import TextingHeader from '../components/TextingHeader';
// components
import HelmetIntl from 'components/HelmetIntl';
// styling
import styled from 'styled-components';

const StyledSMSCampaignForm = styled(SMSCampaignForm)`
  width: 500px;
`;

const NewSMSCampaign = () => {
  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'Create new SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'Create new SMS description',
        }}
      />
      <TextingHeader headerMessage="New SMS" onClickGoBack={clHistory.goBack} />
      <StyledSMSCampaignForm />
    </>
  );
};

export default NewSMSCampaign;
