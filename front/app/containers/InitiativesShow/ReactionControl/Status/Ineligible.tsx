import React from 'react';
import styled, { useTheme } from 'styled-components';
import {
  colors,
  fontSizes,
  media,
  Box,
  Icon,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from '../SharedStyles';
import ProposalProgressBar from '../ProposalProgressBar';
import Button from 'components/UI/Button';
import T from 'components/T';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from '.';
import ReadAnswerButton from './components/ReadAnswerButton';

const StatusIcon = styled(Icon)`
  path {
    fill: ${colors.coolGrey600};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

const ReactionCounter = styled.div`
  margin-top: 15px;
  ${media.tablet`
    display: none;
  `}
`;

const ReactionTexts = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const ReactionText = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.coolGrey600};
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

const Ineligible = ({
  initiative,
  initiativeSettings: { eligibility_criteria, reacting_threshold },
  initiativeStatus,
  onScrollToOfficialFeedback,
}: StatusComponentProps) => {
  const theme = useTheme();
  const reactionCount = initiative.attributes.likes_count;
  const reactionLimit = reacting_threshold;

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
              {eligibility_criteria && (
                <IconTooltip
                  icon="info-outline"
                  iconColor={theme.colors.tenantText}
                  theme="light"
                  placement="bottom"
                  content={<T value={eligibility_criteria} supportHtml />}
                />
              )}
            </>
          )}
        </FormattedMessage>
      </StatusExplanation>
      <Box mb="24px">
        <ReactionCounter>
          <ReactionTexts>
            <ReactionText>
              <FormattedMessage
                {...messages.xVotes}
                values={{ count: reactionCount }}
              />
            </ReactionText>
            <ReactionText>{reactionLimit}</ReactionText>
          </ReactionTexts>
          <ProposalProgressBar
            reactionCount={reactionCount}
            reactionLimit={reactionLimit}
            barColor="linear-gradient(270deg, #84939E 0%, #C8D0D6 100%)"
          />
        </ReactionCounter>
      </Box>
      <ReadAnswerButton onClick={onScrollToOfficialFeedback} />
    </Box>
  );
};

export default Ineligible;
