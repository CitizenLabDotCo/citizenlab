import React from 'react';
import styled from 'styled-components';
import { colors, Box, Icon } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from '../SharedStyles';
import T from 'components/T';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from '.';
import ReactionCounter from './components/ReactionCounter';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${colors.coolGrey600};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

const Expired = ({
  initiative,
  initiativeSettings,
  initiativeStatus,
}: StatusComponentProps) => {
  return (
    <Container>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon ariaHidden name="clock" />
      <StatusExplanation>
        <FormattedMessage
          {...messages.expiredStatusExplanation}
          values={{
            expiredStatusExplanationBold: (
              <b>
                <FormattedMessage
                  {...messages.expiredStatusExplanationBold}
                  values={{
                    votingThreshold: initiativeSettings.reacting_threshold,
                  }}
                />
              </b>
            ),
          }}
        />
      </StatusExplanation>
      <Box mb="24px">
        <ReactionCounter
          initiative={initiative}
          initiativeSettings={initiativeSettings}
          barColor="linear-gradient(270deg, #84939E 0%, #C8D0D6 100%)"
        />
      </Box>
    </Container>
  );
};

export default Expired;
