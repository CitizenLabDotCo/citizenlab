import React, { PureComponent } from 'react';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import T from 'components/T';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../../messages';
import { isNilOrError } from 'utils/helperUtils';
import { round } from 'lodash-es';
import { D3Node } from './';

const borderColor = '#003348';

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

class ProjectCircleLabel extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  render() {
    const { node, hovered, project, intl } = this.props;

    if (isNilOrError(project)) return null;

    return (
      <T value={project.attributes.title_multiloc}>
        {(localizedTitle) => {
          const width = localizedTitle.length * 7 + 50;
          const height = 60;
          const xPos = -width / 2;
          const yPos = -round(node.r + height + 2);
          const borderRadius = 5;

          return (
            <svg
              x={xPos + node.x}
              y={yPos + node.y}
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
              <text fill={borderColor} fontSize="16">
                <tspan
                  x={width / 2}
                  y={height / 2 - 10}
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {intl.formatMessage(messages.project)}
                </tspan>
                <tspan
                  x={width / 2}
                  y={height / 2 + 10}
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
    );
  }
}

const ProjectLabelWithIntl = injectIntl(ProjectCircleLabel);

export default (inputProps: InputProps) => (
  <GetProject projectId={inputProps.projectId}>
    {(project) => <ProjectLabelWithIntl {...inputProps} project={project} />}
  </GetProject>
);
