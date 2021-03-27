import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { mix } from 'polished';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import { isNilOrError } from 'utils/helperUtils';
import { isNil } from 'lodash-es';
import { D3Node } from './';

const borderColor = '#00a2b1';

const StyledCircle: any = styled.circle`
  position: relative;
  fill: ${(props) => mix((props as any).upvoteRatio, 'green', 'red')};
  fill-opacity: 0.75;
  cursor: pointer;

  ${(props) =>
    (props as any).hovered &&
    `
    stroke: ${borderColor};
    stroke-width: 2px;
  `}

  ${(props) =>
    !isNil((props as any).selectionIndex) &&
    `
    stroke: black;
    stroke-width: 2px;
    fill: ${props.theme.comparisonColors[(props as any).selectionIndex]};
  `}
`;

interface InputProps {
  node: D3Node;
  ideaId: string;
  selectionIndex: number | null;
  hovered: boolean;
  onClick: (node: D3Node, event: MouseEvent) => void;
  onMouseEnter: (node: D3Node, event: MouseEvent) => void;
  onMouseLeave: (node: D3Node, event: MouseEvent) => void;
}

interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeaCircle extends PureComponent<Props, State> {
  upvoteRatio = (up: number, down: number) => {
    return up / (up + down);
  };

  handleOnClick = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onClick(node, event);
  };

  handleOnMouseEnter = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseEnter(node, event);
  };

  handleOnMouseLeave = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseLeave(node, event);
  };

  render() {
    const { node, selectionIndex, hovered, idea } = this.props;

    if (isNilOrError(idea)) return null;

    return (
      <StyledCircle
        r={node.r}
        transform={`translate(${node.x},${node.y})`}
        onClick={this.handleOnClick}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
        selectionIndex={selectionIndex}
        hovered={hovered}
        upvoteRatio={this.upvoteRatio(
          idea.attributes.upvotes_count,
          idea.attributes.downvotes_count
        )}
      />
    );
  }
}

export default (inputProps: InputProps) => (
  <GetIdea ideaId={inputProps.ideaId}>
    {(idea) => <IdeaCircle {...inputProps} idea={idea} />}
  </GetIdea>
);
