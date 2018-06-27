import React, { PureComponent } from 'react';
import styled from 'styled-components';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import T from 'components/T';
import { isNilOrError } from 'utils/helperUtils';
import { round } from 'lodash';
import { D3Node } from './';

const StyledCircle: any = styled.circle`
  position: relative;
  fill: green;
  fill-opacity: 0.2;
  cursor: pointer;

  &:hover {
    stroke: red;
    stroke-width: 2px;
  }

  ${props => (props as any).selected && `
    stroke: black;
    stroke-width: 2px;
    fill: ${props.theme.selectionColor};
  `}
`;

interface InputProps {
  node: D3Node;
  projectId: string;
  selected: boolean;
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
    const { node, selected, hovered, project } = this.props;

    if (isNilOrError(project)) return null;

    return (
      <>
        <StyledCircle
          r={node.r}
          onClick={this.handleOnClick}
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
          selected={selected}
          hovered={hovered}
        />
        <T value={project.attributes.title_multiloc}>
          {(localizedTitle) => {
            const width = (localizedTitle.length * 6) + 50;
            const height = 30;
            const xPos = (-width) / 2;
            const yPos = -round(node.r + height + 4);
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
                  stroke="black"
                  strokeWidth="2"
                  fill="#fff"
                />
                <text
                  x={width / 2}
                  y={height / 2}
                  fill="#333"
                  alignment-baseline="middle"
                  text-anchor="middle"
                >
                  {localizedTitle}
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
