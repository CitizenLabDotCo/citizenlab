// libraries
import React from 'react';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';

// components
import ExportMenu from '../../components/ExportMenu';
import {
  IGraphUnit,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
  PieChartStyleFixesDiv,
} from '../..';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import { IUsersByBirthyear, IUsersByRegistrationField } from 'services/stats';
import { IGraphFormat } from 'typings';

interface DataProps {
  serie: IGraphFormat;
}

type ISupportedDataType = IUsersByBirthyear | IUsersByRegistrationField;

interface InputProps {
  stream: (
    streamParams?: IStreamParams | null,
    customId?: string
  ) => IStream<ISupportedDataType>;
  convertToGraphFormat: (ISupportedDataType) => IGraphFormat | null;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId: string;
  xlsxEndpoint: string;
}

interface Props extends InputProps, DataProps {}

const labelColors = ['#C37281 ', '#5D99C6', '#B0CDC4 ', '#C0C2CE'];

class PieChartByCategory extends React.PureComponent<
  Props & InjectedIntlProps
> {
  currentChart: React.RefObject<any>;

  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }

  formatEntry = (entry) => {
    return `${entry.name} : ${entry.value}`;
  };
  render() {
    const { colorMain, animationBegin, animationDuration } = this.props[
      'theme'
    ];
    const {
      className,
      graphTitleString,
      serie,
      xlsxEndpoint,
      currentGroupFilter,
      currentGroupFilterLabel,
    } = this.props;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitleString}</GraphCardTitle>
            {serie && (
              <ExportMenu
                name={graphTitleString}
                svgNode={this.currentChart}
                xlsxEndpoint={xlsxEndpoint}
                currentGroupFilter={currentGroupFilter}
                currentGroupFilterLabel={currentGroupFilterLabel}
              />
            )}
          </GraphCardHeader>
          {!serie ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <PieChartStyleFixesDiv>
              <ResponsiveContainer height={175} width="100%" minWidth={175}>
                <PieChart>
                  <Pie
                    animationDuration={animationDuration}
                    animationBegin={animationBegin}
                    isAnimationActive={true}
                    data={serie}
                    dataKey="value"
                    innerRadius={60}
                    fill={colorMain}
                    label={this.formatEntry}
                    ref={this.currentChart}
                  >
                    {serie.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={labelColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip isAnimationActive={false} />
                </PieChart>
              </ResponsiveContainer>
            </PieChartStyleFixesDiv>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const PieChartByCategoryWithHoCs = injectIntl<Props>(
  withTheme(PieChartByCategory as any) as any
);

const WrappedPieChartByCategory = (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <PieChartByCategoryWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);

export default WrappedPieChartByCategory;
