import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import { ICampaignExampleData } from 'api/campaign_examples/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import Frame from 'react-frame-component';
import styled from 'styled-components';
import T from 'components/T';
import { ICampaign } from 'services/campaigns';

const StyledFrame = styled(Frame)`
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.divider};
  width: 100%;
  height: 450px;
`;

const ExampleFrame = ({
  example,
  campaign,
}: {
  example: ICampaignExampleData;
  campaign?: ICampaign;
}) => {
  const { data: appConfig } = useAppConfiguration();
  const orgName = appConfig?.data.attributes.settings.core.organization_name;
  return (
    <Box>
      <Box mb="16px">
        <Text my="4px">
          <b>Subject:</b> {example.attributes.subject}
        </Text>
        <Text my="4px">
          <b>From:</b> <T value={orgName} />
        </Text>
        <Text my="4px">
          <b>To:</b>{' '}
          <T value={campaign?.data.attributes.recipient_segment_multiloc} />
        </Text>
      </Box>
      <StyledFrame>
        <div
          dangerouslySetInnerHTML={{
            __html: example.attributes.mail_body_html,
          }}
        />
      </StyledFrame>
    </Box>
  );
};

export default ExampleFrame;
