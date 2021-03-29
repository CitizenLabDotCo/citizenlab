// libraries
import React from 'react';
import { isEmpty, map } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// styling
import { withTheme } from 'styled-components';

// components
import ExportMenu from './ExportMenu';
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from '..';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// types
import { ideasByStatusStream, ideasByStatusXlsxEndpoint } from 'services/stats';
import { IGraphFormat } from 'typings';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

interface DataProps {
  serie: IGraphFormat;
}

interface InputProps {
  startAt: string | null | undefined;
  endAt: string | null;
  currentProjectFilter?: string | undefined;
  currentGroupFilter?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  className?: string;
}

interface Props extends InputProps, DataProps {}

export class IdeasByStatusChart extends React.PureComponent<
  Props & InjectedIntlProps
> {
  currentChart: React.RefObject<any>;
  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }

  render() {
    const {
      chartFill,
      chartLabelSize,
      chartLabelColor,
      barHoverColor,
      animationBegin,
      animationDuration,
    } = this.props['theme'];
    const {
      currentGroupFilterLabel,
      currentGroupFilter,
      className,
      serie,
      intl: { formatMessage },
    } = this.props;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    const unitName = formatMessage(messages.inputs);

    const CustomizedLabel = (props) => {
      const { x, y, value } = props;
      return (
        <text
          x={x}
          y={y}
          dx={20}
          dy={-6}
          fontFamily="sans-serif"
          fill={chartLabelColor}
          fontSize={chartLabelSize}
          textAnchor="middle"
        >
          {' '}
          {value}{' '}
        </text>
      );
    };

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages.inputsByStatusTitle} />
            </GraphCardTitle>
            {!noData && (
              <ExportMenu
                name={formatMessage(messages.inputsByStatusTitle)}
                svgNode={this.currentChart}
                xlsxEndpoint={ideasByStatusXlsxEndpoint}
                currentGroupFilterLabel={currentGroupFilterLabel}
                currentGroupFilter={currentGroupFilter}
              />
            )}
          </GraphCardHeader>
          {noData ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <ResponsiveContainer
              height={serie.length > 1 ? serie.length * 50 : 100}
            >
              <BarChart data={serie} layout="vertical" ref={this.currentChart}>
                <Bar
                  dataKey="value"
                  name={unitName}
                  fill={chartFill}
                  label={<CustomizedLabel />}
                  barSize={5}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                >
                  {serie.map((entry, index) => {
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={(entry.color && entry.color) || chartFill}
                        opacity={0.8}
                      />
                    );
                  })}
                </Bar>
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tickLine={false}
                />
                <XAxis
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  type="number"
                  tick={{ transform: 'translate(0, 7)' }}
                />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{ fill: barHoverColor }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const IdeasByStatusChartWithHoCs = injectIntl<Props>(
  withTheme(IdeasByStatusChart as any) as any
);

const WrappedIdeasByStatusChart = (
  inputProps: InputProps & InjectedLocalized
) => {
  const convertToGraphFormat = ({ series: { ideas }, idea_status }) => {
    if (Object.keys(ideas).length <= 0) {
      return null;
    }

    return map(idea_status, (status, id) => ({
      value: ideas[id] || 0,
      name: inputProps.localize(status.title_multiloc),
      code: id,
      color: status.color,
      ordering: status.ordering,
    }));
  };
  return (
    <GetSerieFromStream
      {...inputProps}
      stream={ideasByStatusStream}
      convertToGraphFormat={convertToGraphFormat}
    >
      {(serie) => <IdeasByStatusChartWithHoCs {...serie} {...inputProps} />}
    </GetSerieFromStream>
  );
};

export default injectLocalize(WrappedIdeasByStatusChart);
