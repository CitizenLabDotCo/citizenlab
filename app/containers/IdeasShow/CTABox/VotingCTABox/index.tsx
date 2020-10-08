import React from 'react';
import styled from 'styled-components';
import Voting from './Voting';
import Buttons from '../Buttons';
import { ScreenReaderOnly } from 'utils/a11y';
import { colors } from 'utils/styleUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const Container = styled.div`
  background-color: ${colors.background};
  border-radius: 2px;
  padding: 25px 15px;
`;

const StyledVoting = styled(Voting)`
  margin-bottom: 30px;
`;

interface Props {
  className?: string;
  ideaId: string;
  projectId: string;
}

const VotingCTABox = ({
  className,
  ideaId,
  projectId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <Container className={className}>
      <ScreenReaderOnly>
        <h2>{formatMessage(messages.a11y_votingCTABox)}</h2>
      </ScreenReaderOnly>
      <StyledVoting ideaId={ideaId} projectId={projectId} />
      <Buttons ideaId={ideaId} />
    </Container>
  );
};

export default injectIntl(VotingCTABox);
