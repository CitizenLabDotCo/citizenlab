import React, { PureComponent } from 'react';
import styled from 'styled-components';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { isNilOrError } from 'utils/helperUtils';
import { isNil } from 'lodash-es';
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
  };

  handleOnMouseEnter = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseEnter && this.props.onMouseEnter(node, event);
  };

  handleOnMouseLeave = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseLeave && this.props.onMouseLeave(node, event);
  };

  render() {
    const { node, selectionIndex, hovered, project } = this.props;

    if (isNilOrError(project)) return null;
    return (
      <StyledCircle
        r={node.r}
        onClick={this.handleOnClick}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
        selectionIndex={selectionIndex}
        hovered={hovered}
        transform={`translate(${node.x},${node.y})`}
      />
    );
  }
}

export default (inputProps: InputProps) => (
  <GetProject projectId={inputProps.projectId}>
    {(project) => <ProjectCircle {...inputProps} project={project} />}
  </GetProject>
);
