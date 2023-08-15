import React from 'react';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';

export interface Props {
  link: string;
}

const OnlineLink = ({ link }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Container>
      <StyledIcon name="link" ariaHidden />
      <Content>
        <Box display="flex">
          <Button
            m="0px"
            p="0px"
            buttonStyle="text"
            onClick={() => {
              window.open(link, '_blank');
            }}
            pl="0px"
            fontWeight="bold"
            fontSize="m"
            style={{
              textDecoration: 'underline',
              justifyContent: 'left',
              textAlign: 'left',
            }}
            id="e2e-location-with-coordinates-button"
          >
            {formatMessage(messages.linkToOnlineEvent)}
          </Button>
        </Box>
      </Content>
    </Container>
  );
};

export default OnlineLink;
