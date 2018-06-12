import React, { Component } from 'react';
import styled from 'styled-components';
import GetTopic, { GetTopicChildProps } from 'resources/GetTopic';
import T from 'components/T';
import { isNilOrError } from 'utils/helperUtils';

const StyledCircle: any = styled.circle`
  fill: green;
  opacity: 0.2;

  &:hover {
    stroke: grey;
    stroke-width: 3px;
  }
  ${props => (props as any).selected && `
    stroke: black;
    stroke-width: 3px;
    fill: yellow;
    opacity: 0.4;
  `}
`;

const StyledText: any = styled.text`
  font-size: ${props => (props as any).size}px;
`;

type Props = {
  node: any;
  topic: GetTopicChildProps;
  selected: boolean;
  hovered?: boolean;
  onClick?: (any) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

class TopicCircle extends Component<Props> {

  render() {
    const { topic, node, selected, hovered } = this.props;
    if (isNilOrError(topic)) return null;
    return (
      <>
        <StyledCircle
          r={node.r}
          onClick={this.props.onClick}
          onMouseEnter={this.props.onMouseEnter}
          onMouseLeave={this.props.onMouseLeave}
          selected={selected}
        />
        <StyledText
          x={0}
          y={-node.r}
          textAnchor="middle"
          alignmentBaseline="central"
          show={selected || hovered}
          size={12 + (2 * node.height)}
        >
          <T value={topic.attributes.title_multiloc}>
            {(v) => <>{v}</>}
          </T>
        </StyledText>
      </>
    );
  }
}

export default (inputProps) => (
  <GetTopic id={inputProps.topicId}>
    {(topic) => <TopicCircle {...inputProps} topic={topic} />}
  </GetTopic>
);
