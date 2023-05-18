import React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../components/TextingHeader';
import SMSCampaignForm from '../components/SMSCampaignForm';
import { Box, colors } from '@citizenlab/cl2-component-library';

// utils
import clHistory from 'utils/cl-router/history';

// styling
import styled from 'styled-components';

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
