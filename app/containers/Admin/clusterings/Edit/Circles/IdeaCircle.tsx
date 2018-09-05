import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { mix } from 'polished';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import T from 'components/T';
import { isNilOrError } from 'utils/helperUtils';
import { round, isNil } from 'lodash-es';
import { D3Node } from './';

const borderColor = '#00a2b1';

const StyledCircle: any = styled.circle`
  position: relative;
  fill: ${props => mix((props as any).upvoteRatio, 'green', 'red')};
  fill-opacity: 0.75;
  cursor: pointer;

  ${props => (props as any).hovered && `
    stroke: ${borderColor};
    stroke-width: 2px;
  `}

  ${props => !isNil((props as any).selectionIndex) && `
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
  }

  handleOnClick = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onClick(node, event);
  }

  handleOnMouseEnter = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseEnter(node, event);
  }

  handleOnMouseLeave = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseLeave(node, event);
  }

  render() {
    const { node, selectionIndex, hovered, idea } = this.props;

    if (isNilOrError(idea)) return null;

    return (
      <>
        <StyledCircle
          r={node.r}
          onClick={this.handleOnClick}
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
          selectionIndex={selectionIndex}
          hovered={hovered}
          upvoteRatio={this.upvoteRatio(idea.attributes.upvotes_count, idea.attributes.downvotes_count)}
        />
        <T value={idea.attributes.title_multiloc}>
          {(localizedTitle) => {
            const width = (localizedTitle.length * 7) + 50;
            const height = 60;
            const xPos = (-width) / 2;
            const yPos = -round(node.r + height + 2);
            const borderRadius = 5;

            return (
              <svg
                x={xPos}
                y={yPos}
                width={width}
                height={height}
                style={{ display: `${hovered ? 'block' : 'none'}` }}
              >
                <rect
                  x="0"
                  y="0"
                  width={width}
                  height={height}
                  rx={borderRadius}
                  ry={borderRadius}
                  stroke={borderColor}
                  strokeWidth="2"
                  fill="#fff"
                />
                <text
                  fill={borderColor}
                  fontSize="16"
                >
                  <tspan
                    x={width / 2}
                    y={(height / 2) - 10}
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="central"
                  >
                    Idea
                  </tspan>
                  <tspan
                    x={width / 2}
                    y={(height / 2) + 10}
                    fontWeight="normal"
                    textAnchor="middle"
                    alignmentBaseline="central"
                  >
                    {localizedTitle}
                  </tspan>
                </text>
              </svg>
            );
          }}
        </T>
      </>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetIdea id={inputProps.ideaId}>
    {(idea) => <IdeaCircle {...inputProps} idea={idea} />}
  </GetIdea>
);
