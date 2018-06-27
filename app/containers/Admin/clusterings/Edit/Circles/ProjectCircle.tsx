import React, { PureComponent } from 'react';
import styled from 'styled-components';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import T from 'components/T';
import { isNilOrError } from 'utils/helperUtils';
import { round, isNil } from 'lodash';
import { D3Node } from './';

const borderColor = '#003348';

const StyledCircle: any = styled.circle`
  position: relative;
  fill: green;
  fill-opacity: 0.2;
  cursor: pointer;

  &:hover {
    stroke: ${borderColor};
    stroke-width: 2px;
  }

  ${props => !isNil((props as any).selectionIndex) && `
    stroke: black;
    stroke-width: 2px;
    fill: ${props.theme.comparisonColors[(props as any).selectionIndex]};
  `}
`;

interface InputProps {
  node: D3Node;
  projectId: string;
  selectionIndex: number | null;
  hovered: boolean;
  onClick: (node: D3Node, event: MouseEvent) => void;
  onMouseEnter: (node: D3Node, event: MouseEvent) => void;
  onMouseLeave: (node: D3Node, event: MouseEvent) => void;
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectCircle extends PureComponent<Props, State> {

  handleOnClick = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onClick && this.props.onClick(node, event);
  }

  handleOnMouseEnter = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseEnter && this.props.onMouseEnter(node, event);
  }

  handleOnMouseLeave = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseLeave && this.props.onMouseLeave(node, event);
  }

  render() {
    const { node, selectionIndex, hovered, project } = this.props;

    if (isNilOrError(project)) return null;

    return (
      <>
        <StyledCircle
          r={node.r}
          onClick={this.handleOnClick}
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
          selectionIndex={selectionIndex}
          hovered={hovered}
        />
        <T value={project.attributes.title_multiloc}>
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
                    Project
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
  <GetProject id={inputProps.projectId}>
    {(project) => <ProjectCircle {...inputProps} project={project} />}
  </GetProject>
);
