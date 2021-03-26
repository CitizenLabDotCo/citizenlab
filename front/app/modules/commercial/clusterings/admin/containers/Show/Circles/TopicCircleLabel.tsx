import React, { PureComponent } from 'react';
import GetTopic, { GetTopicChildProps } from 'resources/GetTopic';
import T from 'components/T';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../../messages';
import { isNilOrError } from 'utils/helperUtils';
import { round } from 'lodash-es';
import { D3Node } from './';

const borderColor = 'purple';

interface InputProps {
  node: D3Node;
  topicId: string;
  selectionIndex: number | null;
  hovered: boolean;
  onClick: (node: D3Node, event: MouseEvent) => void;
  onMouseEnter: (node: D3Node, event: MouseEvent) => void;
  onMouseLeave: (node: D3Node, event: MouseEvent) => void;
}

interface DataProps {
  topic: GetTopicChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class TopicCircleLabel extends PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { node, hovered, topic, intl } = this.props;

    if (isNilOrError(topic)) return null;

    return (
      <T value={topic.attributes.title_multiloc}>
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
                  {intl.formatMessage(messages.topic)}
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

const TopicLabelWithIntl = injectIntl(TopicCircleLabel);

export default (inputProps: InputProps) => (
  <GetTopic id={inputProps.topicId}>
    {(topic) => <TopicLabelWithIntl {...inputProps} topic={topic} />}
  </GetTopic>
);
