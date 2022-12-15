import React, { PureComponent } from 'react';
import styled, { withTheme } from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { IAppConfigurationSettings } from 'services/appConfiguration';

import { Icon, IconTooltip } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';

import ProposalProgressBar from './ProposalProgressBar';
import Button from 'components/UI/Button';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${colors.coolGrey600};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

const VoteCounter = styled.div`
  margin-top: 15px;
  ${media.tablet`
    display: none;
  `}
`;

const VoteTexts = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const VoteText = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.coolGrey600};
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userVoted: boolean;
  onScrollToOfficialFeedback: () => void;
}
interface DataProps {}

interface Props extends InputProps, DataProps {
  theme?: any;
}

interface State {}

class Ineligible extends PureComponent<Props, State> {
  handleOnReadAnswer = () => {
    this.props.onScrollToOfficialFeedback();
  };

  render() {
    const {
      initiative,
      initiativeSettings: { eligibility_criteria, voting_threshold },
      initiativeStatus,
    } = this.props;
    const voteCount = initiative.attributes.upvotes_count;
    const voteLimit = voting_threshold;

    return (
      <Container>
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
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
                    iconColor={this.props.theme.colors.tenantText}
                    theme="light"
                    placement="bottom"
                    content={<T value={eligibility_criteria} supportHtml />}
                  />
                )}
              </>
            )}
          </FormattedMessage>
        </StatusExplanation>
        <VoteCounter>
          <VoteTexts>
            <VoteText>
              <FormattedMessage
                {...messages.xVotes}
                values={{ count: voteCount }}
              />
            </VoteText>
            <VoteText>{voteLimit}</VoteText>
          </VoteTexts>
          <ProposalProgressBar
            voteCount={voteCount}
            voteLimit={voteLimit}
            barColor="linear-gradient(270deg, #84939E 0%, #C8D0D6 100%)"
          />
        </VoteCounter>
        <StyledButton onClick={this.handleOnReadAnswer}>
          <FormattedMessage {...messages.readAnswer} />
        </StyledButton>
      </Container>
    );
  }
}

export default withTheme(Ineligible);
