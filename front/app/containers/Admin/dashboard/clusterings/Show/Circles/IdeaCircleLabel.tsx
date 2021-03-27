import React, { PureComponent } from 'react';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import T from 'components/T';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import { isNilOrError } from 'utils/helperUtils';
import { round } from 'lodash-es';
import { D3Node } from './';

const borderColor = '#00a2b1';

interface InputProps {
  node: D3Node;
  ideaId: string;
  hovered: boolean;
  selectionIndex: number | null;
  onClick: (node: D3Node, event: MouseEvent) => void;
  onMouseEnter: (node: D3Node, event: MouseEvent) => void;
  onMouseLeave: (node: D3Node, event: MouseEvent) => void;
}

interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeaCircleLabel extends PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { node, hovered, idea, intl } = this.props;

    if (isNilOrError(idea)) return null;

    return (
      <>
        <T value={idea.attributes.title_multiloc}>
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
                    {intl.formatMessage(messages.title)}
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
      </>
    );
  }
}

const IdeaLabelWithIntl = injectIntl(IdeaCircleLabel);

export default (inputProps: InputProps) => (
  <GetIdea ideaId={inputProps.ideaId}>
    {(idea) => <IdeaLabelWithIntl {...inputProps} idea={idea} />}
  </GetIdea>
);
