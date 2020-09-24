// libraries
import React, { ReactElement } from 'react';
import { isEmpty } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';

// components
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
} from 'recharts';
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
  IIdeasByStatus,
} from 'services/stats';
import { IGraphFormat } from 'typings';

interface DataProps {
  serie: IGraphFormat;
}

type ISupportedDataType =
  | IUsersByBirthyear
  | IUsersByRegistrationField
  | IUsersByDomicile
  | IIdeasByStatus;

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
  exportMenu?: ReactElement;
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
      chartFill,
      chartLabelSize,
      chartLabelColor,
      barFill,
      animationBegin,
      animationDuration,
    } = this.props['theme'];
    const {
      className,
      graphTitleString,
      serie,
      intl: { formatMessage },
      graphUnit,
      exportMenu,
    } = this.props;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    const unitName = formatMessage(messages[graphUnit]);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitleString}</GraphCardTitle>
            {!noData &&
              exportMenu &&
              React.cloneElement(exportMenu, { svgNode: this.currentChart })}
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
                {graphTitleString ===
                formatMessage(messages.ideasByStatusTitle) ? (
                  <Bar
                    dataKey="value"
                    name={formatMessage(messages['ideas'])}
                    fill={chartFill}
                    label={
                      <CustomizedLabel
                        fill={chartLabelColor}
                        fontSize={chartLabelSize}
                      />
                    }
                    barSize={5}
                    animationDuration={animationDuration}
                    animationBegin={animationBegin}
                  >
                    {serie
                      .sort((a, b) =>
                        a.ordering && b.ordering ? a.ordering - b.ordering : -1
                      )
                      .map((entry, index) => {
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color && entry.color}
                            opacity={0.8}
                          />
                        );
                      })}
                  </Bar>
                ) : (
                  <Bar
                    dataKey="value"
                    name={unitName}
                    fill={chartFill}
                    label={{
                      fill: barFill,
                      fontSize: chartLabelSize,
                      position: 'insideLeft',
                    }}
                    barSize={20}
                    animationDuration={animationDuration}
                    animationBegin={animationBegin}
                  />
                )}

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
