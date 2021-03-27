// libraries
import React from 'react';
import { isEmpty } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';

// components
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  IGraphUnit,
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from '../..';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// types
import { IStreamParams, IStream } from 'utils/streams';
import {
  IUsersByBirthyear,
  IUsersByRegistrationField,
  IUsersByDomicile,
} from 'services/stats';
import { IGraphFormat } from 'typings';
import ExportMenu from '../../components/ExportMenu';

interface DataProps {
  serie: IGraphFormat;
}

type ISupportedDataType =
  | IUsersByBirthyear
  | IUsersByRegistrationField
  | IUsersByDomicile;

interface InputProps {
  stream: (
    streamParams?: IStreamParams | null,
    customId?: string
  ) => IStream<ISupportedDataType>;
  convertToGraphFormat: (data: ISupportedDataType) => IGraphFormat | null;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId?: string;
  xlsxEndpoint?: string;
}

interface Props extends InputProps, DataProps {}

export class HorizontalBarChart extends React.PureComponent<
  Props & InjectedIntlProps
> {
  currentChart: React.RefObject<any>;
  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }
  render() {
    const {
      chartLabelSize,
      chartLabelColor,
      barFill,
      animationBegin,
      animationDuration,
      newBarFill,
    } = this.props['theme'];
    const {
      className,
      graphTitleString,
      serie,
      intl: { formatMessage },
      graphUnit,
      xlsxEndpoint,
    } = this.props;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    const unitName = formatMessage(messages[graphUnit]);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitleString}</GraphCardTitle>
            {!noData && (
              <ExportMenu
                svgNode={this.currentChart}
                xlsxEndpoint={xlsxEndpoint}
                name={graphTitleString}
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
                  fill={newBarFill}
                  label={{
                    fill: barFill,
                    fontSize: chartLabelSize,
                    position: 'insideLeft',
                  }}
                  barSize={graphUnit === 'ideas' ? 5 : 20}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                />
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
              </BarChart>
            </ResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const HorizontalBarChartWithHoCs = injectIntl<Props>(
  withTheme(HorizontalBarChart as any) as any
);

const WrappedHorizontalBarChart = (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <HorizontalBarChartWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);

export const CustomizedLabel = (props) => {
  const { x, y, value } = props;
  return (
    <text
      x={x}
      y={y}
      dx={20}
      dy={-6}
      fontFamily="sans-serif"
      fill={props.fill}
      fontSize={props.fontSize}
      textAnchor="middle"
    >
      {' '}
      {value}{' '}
    </text>
  );
};

export default WrappedHorizontalBarChart;
