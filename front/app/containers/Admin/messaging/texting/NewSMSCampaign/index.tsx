import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import HelmetIntl from 'components/HelmetIntl';

import clHistory from 'utils/cl-router/history';

import SMSCampaignForm from '../components/SMSCampaignForm';
import TextingHeader from '../components/TextingHeader';

const StyledSMSCampaignForm = styled(SMSCampaignForm)`
  width: 500px;
`;

const NewSMSCampaign = () => {
  return (
    <Box background={colors.white} p="40px">
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'Create new SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'Create new SMS description',
        }}
      />
      <TextingHeader headerMessage="New SMS" onClickGoBack={clHistory.goBack} />
      <StyledSMSCampaignForm />
    </Box>
  );
};

export default NewSMSCampaign;
