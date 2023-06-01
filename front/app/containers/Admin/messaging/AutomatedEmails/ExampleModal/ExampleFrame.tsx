import React from 'react';
import styled from 'styled-components';

// Components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Frame from 'react-frame-component';

// Hooks
import { ICampaign } from 'services/campaigns';
import { ICampaignExampleData } from 'api/campaign_examples/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

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
  campaign: ICampaign;
}) => {
  const { data: appConfig } = useAppConfiguration();
  const orgName = appConfig?.data.attributes.settings.core.organization_name;
  return (
    <Box>
      <Box mb="16px">
        <Box my="4px" display="flex" gap="8px">
          <Text fontWeight="bold" my="0">
            <FormattedMessage {...messages.subject} />
          </Text>
          <Text my="0">{example.attributes.subject}</Text>
        </Box>
        <Box my="4px" display="flex" gap="8px">
          <Text fontWeight="bold" my="0">
            <FormattedMessage {...messages.from} />
          </Text>
          <Text my="0">
            <T value={orgName} />
          </Text>
        </Box>
        <Box my="4px" display="flex" gap="8px">
          <Text fontWeight="bold" my="0">
            <FormattedMessage {...messages.to} />
          </Text>
          <Text my="0">
            <T value={campaign?.data.attributes.recipient_segment_multiloc} />
          </Text>
        </Box>
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
