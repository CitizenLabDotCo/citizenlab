// Libs
import * as React from 'react';

// Components
import GetIdea from 'utils/resourceLoaders/components/GetIdea';
import T from 'components/T';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Style
import styled from 'styled-components';
import VoteControl from 'components/VoteControl';

const Wrapper = styled.div`
  align-items: strech;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 30px;
`;

const Title = styled.h2``;

const Description = styled.div`
  flex: 0 1 auto;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const VoteComments = styled.div`
  flex: 1 0 auto;
  margin-bottom: 1rem;
`;
const StyledButton = styled(Button)`
  justify-self: flex-end;
`;

// Typings
export interface Props {
  idea: string;
  className?: string;
}

export default class IdeaBox extends React.Component<Props> {
  render() {
    return (
      <GetIdea id={this.props.idea}>
        {({ idea }) => {
          if (!idea) {
            return null;
          } else {
            return (
              <Wrapper className={this.props.className}>
                <Title><T value={idea.attributes.title_multiloc} /></Title>
                <Description><T value={idea.attributes.body_multiloc} /></Description>
                <VoteComments>
                  <VoteControl ideaId={idea.id} size="small" />
                </VoteComments>
                <StyledButton circularCorners={false} width="100%" linkTo={`/ideas/${idea.attributes.slug}`}>
                  <FormattedMessage {...messages.seeIdea} />
                </StyledButton>
              </Wrapper>
            );
          }
        }}
      </GetIdea>
    );
  }
}
