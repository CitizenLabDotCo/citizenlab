import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

import GetIdeaVotesCount, { GetIdeaVotesCountChildProps } from 'resources/GetIdeaVotesCount';

import Icon from 'components/UI/Icon';

import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container: any = styled.div`
  display: flex;
  align-items: center;

  * {
    user-select: none;
  }
`;

const VoteIconContainer: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: solid 1px ${lighten(0.4, colors.label)};
  background: #fff;
  transition: all 100ms ease-out;
  will-change: transform;
  width: 55px;
  height: 55px;
`;

const VoteIcon: any = styled(Icon)`
  height: 19px;
  fill: ${colors.label};
  transition: all 100ms ease-out;
  height: 20px;
  width: 23px;
`;

const VoteCount = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-left: 5px;
  transition: all 100ms ease-out;
`;

const Vote: any = styled.div`
  display: flex;
  align-items: center;
`;

const Upvote = Vote.extend`
  margin-right: 12px;
`;

interface DataProps {
  votesCount: GetIdeaVotesCountChildProps;
}

interface InputProps {
  ideaId: string;
  className?: string;
}

interface Props extends InputProps, DataProps {}

const VotePreview = (props: Props) => {
  const { votesCount, className } = props;
  if (!isNilOrError(votesCount)) {
    return (
      <Container className={`${className} e2e-vote-preview`}>
        <Upvote>
          <VoteIconContainer>
            <VoteIcon name="upvote-2"/>
          </VoteIconContainer>
          <VoteCount>{votesCount.up}</VoteCount>
        </Upvote>
        <Vote>
          <VoteIconContainer>
            <VoteIcon name="downvote-2"/>
          </VoteIconContainer>
          <VoteCount>{votesCount.down}</VoteCount>
        </Vote>
      </Container>
    );
  }
  return null;
};

export default (inputProps: InputProps) => (
  <GetIdeaVotesCount ideaId={inputProps.ideaId}>
    {votesCount => <VotePreview {...inputProps} votesCount={votesCount} />}
  </GetIdeaVotesCount>
);
