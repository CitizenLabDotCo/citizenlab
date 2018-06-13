import React, { PureComponent } from 'react';
import styled from 'styled-components';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
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
    fill: ${props.theme.selectionColor};
    opacity: 0.4;
  `}
`;

const StyledText: any = styled.text`
  font-size: ${props => (props as any).size}px;
`;

type Props = {
  node: any;
  project: GetProjectChildProps;
  selected: boolean;
  hovered?: boolean;
  onClick?: (any) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

class ProjectCircle extends PureComponent<Props> {

  render() {
    const { project, node, selected, hovered } = this.props;
    if (isNilOrError(project)) return null;
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
          <T value={project.attributes.title_multiloc}>
            {(v) => <>{v}</>}
          </T>
        </StyledText>
      </>
    );
  }
}

export default (inputProps) => (
  <GetProject id={inputProps.projectId}>
    {(project) => <ProjectCircle {...inputProps} project={project} />}
  </GetProject>
);
