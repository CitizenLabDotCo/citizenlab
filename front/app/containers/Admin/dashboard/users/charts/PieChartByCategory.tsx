// libraries
import React from 'react';

// intl
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// utils
import renderTooltip from './renderPieChartByCategoryTooltip';
import { roundPercentages } from 'utils/math';

// styling
import { withTheme } from 'styled-components';
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

// components
import PieChart from 'components/admin/Graphs/PieChart';
import {
  GraphCard,
  GraphCardHeader,
  GraphCardInner,
  GraphCardTitle,
  IGraphUnit,
  NoDataContainer,
  PieChartStyleFixesDiv,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';

// resources
import GetSerieFromStream from 'resources/GetSerieFromStream';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import { IGraphFormat } from 'typings';

interface DataProps {
  serie: IGraphFormat;
}

interface Serie extends IGraphFormat {
  percentage: number;
}

export interface ISupportedDataTypeMap {}

export type ISupportedDataType =
  ISupportedDataTypeMap[keyof ISupportedDataTypeMap];

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

class PieChartByCategory extends React.PureComponent<
  Props & WrappedComponentProps
> {
  currentChart: React.RefObject<any>;

  constructor(props: Props & WrappedComponentProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }

  makeLegends = (row, i): LegendItem => ({
    icon: 'circle',
    color: categoricalColorScheme({ rowIndex: i }),
    label: `${row.name} (${row.percentage}%)`,
  });

  addPercentages = (serie): Serie | undefined => {
    if (!serie) return;
    const percentages = roundPercentages(serie.map((row) => row.value));
    return serie.map((row, i) => ({
      ...row,
      percentage: percentages[i],
    }));
  };

  render() {
    const {
      startAt,
      endAt,
      className,
      graphTitleString,
      serie,
      xlsxEndpoint,
      currentGroupFilter,
      currentGroupFilterLabel,
    } = this.props;

    const percentagesSerie = this.addPercentages(serie);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>{graphTitleString}</GraphCardTitle>
            {serie && (
              <ReportExportMenu
                name={graphTitleString}
                svgNode={this.currentChart}
                xlsx={{ endpoint: xlsxEndpoint }}
                currentGroupFilter={currentGroupFilter}
                currentGroupFilterLabel={currentGroupFilterLabel}
                startAt={startAt}
                endAt={endAt}
              />
            )}
          </GraphCardHeader>
          {!percentagesSerie ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <PieChartStyleFixesDiv>
              <PieChart
                data={percentagesSerie}
                width={164}
                mapping={{
                  angle: 'value',
                  name: 'name',
                }}
                pie={{
                  startAngle: 0,
                  endAngle: 360,
                  outerRadius: 60,
                }}
                tooltip={renderTooltip()}
                legend={{
                  items: percentagesSerie.map(this.makeLegends),
                  maintainGraphSize: true,
                  marginLeft: 50,
                  position: 'right-center',
                }}
                innerRef={this.currentChart}
              />
            </PieChartStyleFixesDiv>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const PieChartByCategoryWithHoCs = injectIntl(
  withTheme(PieChartByCategory as any) as any
);

const WrappedPieChartByCategory = (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <PieChartByCategoryWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);

export default WrappedPieChartByCategory;
