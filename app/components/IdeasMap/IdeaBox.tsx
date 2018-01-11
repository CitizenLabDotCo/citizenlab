// Libs
import * as React from 'react';

// Components
import GetIdea from 'utils/resourceLoaders/components/GetIdea';
import T from 'components/T';

// Style
import styled from 'styled-components';

const Wrapper = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  align-items: strech;
  padding: 30px;
`;

const Title = styled.h2``;
const Description = styled.div``;
const Buttons = styled.div``;

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
                <Buttons />
              </Wrapper>
            );
          }
        }}
      </GetIdea>
    );
  }
}
