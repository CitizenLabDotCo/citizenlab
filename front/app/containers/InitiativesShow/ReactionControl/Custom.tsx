import React, { PureComponent } from 'react';

import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';
import { StatusExplanation } from './SharedStyles';

import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { IAppConfigurationSettings } from 'api/app_configuration/types';

import CountDown from './CountDown';
import Button from 'components/UI/Button';
import ProposalProgressBar from './ProposalProgressBar';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';
import { IInitiativeData } from 'api/initiatives/types';

const Container = styled.div``;

const CountDownWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;

  ${media.tablet`
    display: none;
  `}
`;

const ReactionCounter = styled.div`
  margin-top: 15px;
`;

const ReactionText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const ReactionTextLeft = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantPrimary};
`;

const ReactionTextRight = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userReacted: boolean;
  onReaction: () => void;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

class Custom extends PureComponent<Props & { theme: any }> {
  handleOnReaction = () => {
    this.props.onReaction();
  };

  render() {
    const {
      initiative,
      initiativeStatus,
      initiativeSettings: { reacting_threshold },
      userReacted,
    } = this.props;
    const reactionCount = initiative.attributes.likes_count;
    const reactionLimit = reacting_threshold;

    return (
      <Container>
        <CountDownWrapper>
          <CountDown targetTime={initiative.attributes.expires_at} />
        </CountDownWrapper>
        <StatusExplanation>
          <T value={initiativeStatus.attributes.description_multiloc} />
        </StatusExplanation>
        <ReactionCounter>
          <ReactionText aria-hidden={true}>
            <ReactionTextLeft>
              <FormattedMessage
                {...messages.xVotes}
                values={{ count: reactionCount }}
              />
            </ReactionTextLeft>
            <ReactionTextRight>{reactionLimit}</ReactionTextRight>
          </ReactionText>
          <ProposalProgressBar
            reactionCount={reactionCount}
            reactionLimit={reactionLimit}
          />
        </ReactionCounter>
        {!userReacted && (
          <StyledButton
            icon="vote-up"
            buttonStyle="primary"
            onClick={this.handleOnReaction}
          >
            <FormattedMessage {...messages.vote} />
          </StyledButton>
        )}
      </Container>
    );
  }
}

export default Custom;
