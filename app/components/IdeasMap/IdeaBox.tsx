// Libs
import * as React from 'react';

// Components
// import T from 'components/T';

// Style
import styled from 'styled-components';

const Wrapper = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  align-items: strech;
  padding: 30px;
`;

// const Title = styled.h2``;
// const Description = styled.div``;
const Buttons = styled.div``;

// Typings
export interface Props {
  idea: string;
  className?: string;
}

export default class IdeaBox extends React.Component<Props> {
  render() {
    const { idea } = this.props;

    return (
      <Wrapper className={this.props.className}>
        {idea}
        {/* <Title><T value={idea.attributes.title_multiloc} /></Title>
        <Description><T value={idea.attributes.body_multiloc} /></Description> */}
        <Buttons />
      </Wrapper>
    );
  }
}
