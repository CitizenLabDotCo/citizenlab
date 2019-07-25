import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { ITenantSettings } from 'services/tenant';

import Icon from 'components/UI/Icon';
import { StatusWrapper, StatusExplanation, TooltipWrapper, HelpIcon } from './SharedStyles';
import Tooltip from 'components/UI/Tooltip';
import ProgressBar from 'components/UI/ProgressBar';
import Button from 'components/UI/Button';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${colors.clGreyOnGreyBackground};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

const StyledTooltip = styled(Tooltip)`
  display: inline;
`;

const VoteCounter = styled.div`
  margin-top: 15px;
`;

const VoteTexts = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const VoteText = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.clGreyOnGreyBackground};
`;

const StyledProgressBar = styled(ProgressBar)`
  height: 12px;
  width: 100%;
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<ITenantSettings['initiatives']>;
  userVoted: boolean;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class IneligibleVoteControl extends PureComponent<Props, State> {
  render() {
    const { initiative, initiativeSettings: { eligibility_criteria, voting_threshold }, initiativeStatus } = this.props;

    const voteCount = initiative.attributes.upvotes_count;
    const voteLimit = voting_threshold || 1;

    return (
      <Container>
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
        <StatusIcon name="halt" />
        <StatusExplanation>
          <FormattedMessage
            {...messages.ineligibleStatusExplanation}
            values={{
              ineligibleStatusExplanationBold: <b><FormattedMessage {...messages.ineligibleStatusExplanationBold} /></b>
            }}
          />
          {eligibility_criteria &&
            <StyledTooltip
              content={
                <TooltipWrapper>
                  <T value={eligibility_criteria} supportHtml />
                </TooltipWrapper>
              }
              top="20"
            >
              <HelpIcon name="info" />
            </StyledTooltip>
          }
        </StatusExplanation>
        <VoteCounter>
          <VoteTexts>
            <VoteText>
              <FormattedMessage {...messages.xVotes} values={{ count: voteCount }} />
            </VoteText>
            <VoteText>
              {voteLimit}
            </VoteText>
          </VoteTexts>
          <StyledProgressBar
            progress={voteCount / voteLimit}
            color="linear-gradient(270deg, #84939E 0%, #C8D0D6 100%)"
            bgColor={colors.lightGreyishBlue}
          />
        </VoteCounter>
        <StyledButton>
          <FormattedMessage {...messages.readAnswer} />
        </StyledButton>
      </Container>
    );
  }
}

export default IneligibleVoteControl;
