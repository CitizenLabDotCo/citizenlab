import React from 'react';
import styled, { useTheme } from 'styled-components';
import {
  colors,
  Box,
  Icon,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from '../SharedStyles';
import T from 'components/T';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from '.';
import ReadAnswerButton from './components/ReadAnswerButton';
import ReactionCounter from './components/ReactionCounter';

const StatusIcon = styled(Icon)`
  path {
    fill: ${colors.coolGrey600};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

const Ineligible = ({
  initiative,
  initiativeSettings,
  initiativeStatus,
  onScrollToOfficialFeedback,
}: StatusComponentProps) => {
  const theme = useTheme();

  return (
    <Box>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon ariaHidden name="halt" />
      <StatusExplanation>
        <FormattedMessage
          {...messages.ineligibleStatusExplanation}
          values={{
            ineligibleStatusExplanationBold: (
              <b>
                <FormattedMessage
                  {...messages.ineligibleStatusExplanationBold}
                />
              </b>
            ),
          }}
        >
          {(text) => (
            <>
              {text}
              <IconTooltip
                icon="info-outline"
                iconColor={theme.colors.tenantText}
                theme="light"
                placement="bottom"
                content={
                  <T
                    value={initiativeSettings.eligibility_criteria}
                    supportHtml
                  />
                }
              />
            </>
          )}
        </FormattedMessage>
      </StatusExplanation>
      <Box mb="24px">
        <ReactionCounter
          initiative={initiative}
          initiativeSettings={initiativeSettings}
          barColor="linear-gradient(270deg, #84939E 0%, #C8D0D6 100%)"
        />
      </Box>
      <ReadAnswerButton onClick={onScrollToOfficialFeedback} />
    </Box>
  );
};

export default Ineligible;
