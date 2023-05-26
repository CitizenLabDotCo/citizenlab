import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import { ICampaignExampleData } from 'api/campaign_examples/types';
import useUser from 'hooks/useUser';
import { isNilOrError } from 'utils/helperUtils';

import Frame from 'react-frame-component';
import styled from 'styled-components';

const StyledFrame = styled(Frame)`
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.divider};
  width: 100%;
  height: 450px;
`;

const ExampleFrame = ({ example }: { example: ICampaignExampleData }) => {
  const user = useUser({ userId: example.relationships.recipient.data.id });
  return (
    <Box>
      <Box>
        <Text>subject: {example.attributes.subject}</Text>
      </Box>
      <Box>
        <Text>to: {!isNilOrError(user) && user.attributes.email}</Text>
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
