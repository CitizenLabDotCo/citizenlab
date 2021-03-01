// libraries
import React, { PureComponent } from 'react';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import styled, { withTheme } from 'styled-components';
import { media } from 'utils/styleUtils';

// resource
import GetSerieFromStream from 'resources/GetSerieFromStream';

// components
import ExportMenu from '../../components/ExportMenu';
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  GraphCard,
  NoDataContainer,
  GraphCardInner,
  GraphCardHeaderWithFilter,
  IResolution,
} from '../..';
import { Select } from 'cl2-component-library';
import { HiddenLabel } from 'utils/a11y';

const SHiddenLabel = styled(HiddenLabel)`
  flex: 1;
  margin-right: 15px;
  @media (max-width: 1300px) {
    width: 100%;
  }
`;

const GraphCardTitle = styled.h3`
  margin: 0;
  margin-right: 15px;

  ${media.smallerThan1280px`
    margin-bottom: 15px;
  `}
`;

// typings
import {
  IIdeasByTopic,
  ICommentsByTopic,
  IVotesByTopic,
  IIdeasByProject,
  ICommentsByProject,
  IVotesByProject,
  ideasByTopicXlsxEndpoint,
  ideasByProjectXlsxEndpoint,
  commentsByTopicXlsxEndpoint,
  commentsByProjectXlsxEndpoint,
  votesByTopicXlsxEndpoint,
  votesByProjectXlsxEndpoint,
} from 'services/stats';
import { IStreamParams, IStream } from 'utils/streams';
import { IResource } from '..';
import { IGraphFormat, IOption } from 'typings';

interface DataProps {
  serie: IGraphFormat;
}

type ISupportedData =
  | IIdeasByTopic
  | IVotesByTopic
  | ICommentsByTopic
  | IIdeasByProject
  | IVotesByProject
  | ICommentsByProject;

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
  stream: (streamParams?: IStreamParams | null) => IStream<ISupportedData>;
  convertToGraphFormat: (resource: ISupportedData) => IGraphFormat | null;
  currentFilter: string | undefined;
  byWhat: 'Topic' | 'Project';
  currentProjectFilter: string | undefined;
  currentGroupFilter: string | undefined;
  currentTopicFilter: string | undefined;
  currentProjectFilterLabel: string | undefined;
  currentGroupFilterLabel: string | undefined;
  currentTopicFilterLabel: string | undefined;
  resolution: IResolution;
}

interface InputProps extends QueryProps {
  convertSerie: (
    serie: IGraphFormat | null
  ) => {
    convertedSerie: IGraphFormat | null;
    selectedCount: any;
    selectedName: any;
  };
  className?: string;
  onResourceByXChange: (option: IOption) => void;
  currentSelectedResource: IResource;
  resourceOptions: IOption[];
}

interface Props extends InputProps, DataProps {}

class SelectableResourceChart extends PureComponent<Props & InjectedIntlProps> {
  currentChart: React.RefObject<any>;
  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.currentChart = React.createRef();
  }
  render() {
    const {
      barHoverColor,
      chartLabelSize,
      chartLabelColor,
      barFill,
      animationBegin,
      animationDuration,
      newBarFill,
    } = this.props['theme'];
    const {
      className,
      onResourceByXChange,
      currentSelectedResource,
      resourceOptions,
      intl: { formatMessage },
      currentFilter,
      byWhat,
      convertSerie,
      serie,
    } = this.props;
    const selectedResourceName =
      currentSelectedResource &&
      formatMessage(
        {
          ideas: messages.inputs,
          comments: messages.comments,
          votes: messages.votes,
        }[currentSelectedResource]
      );
    const { convertedSerie, selectedCount, selectedName } = convertSerie(serie);
    const unitName =
      currentFilter && serie
        ? formatMessage(messages.resourceByDifference, {
            selectedResourceName,
            selectedName,
          })
        : selectedResourceName;

    const xlsxEndpointTable = {
      ideasTopic: ideasByTopicXlsxEndpoint,
      commentsTopic: commentsByTopicXlsxEndpoint,
      votesTopic: votesByTopicXlsxEndpoint,
      ideasProject: ideasByProjectXlsxEndpoint,
      commentsProject: commentsByProjectXlsxEndpoint,
      votesProject: votesByProjectXlsxEndpoint,
    };

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeaderWithFilter>
            <GraphCardTitle>
              <FormattedMessage {...messages[`participationPer${byWhat}`]} />
            </GraphCardTitle>
            <SHiddenLabel>
              <FormattedMessage
                {...messages[`hiddenLabelPickResourceBy${byWhat}`]}
              />
              <Select
                id={`select${byWhat}`}
                onChange={onResourceByXChange}
                value={currentSelectedResource}
                options={resourceOptions}
              />
            </SHiddenLabel>
            {serie && (
              <ExportMenu
                className=""
                svgNode={this.currentChart}
                name={formatMessage(messages[`participationPer${byWhat}`])}
                {...this.props}
                xlsxEndpoint={
                  xlsxEndpointTable[currentSelectedResource + byWhat]
                }
              />
            )}
          </GraphCardHeaderWithFilter>
          {!serie ? (
            <NoDataContainer>
              {currentFilter && selectedCount ? (
                <FormattedMessage
                  {...messages.totalCount}
                  values={{ selectedCount, selectedName, selectedResourceName }}
                />
              ) : (
                <FormattedMessage {...messages.noData} />
              )}
            </NoDataContainer>
          ) : (
            <>
              {currentFilter && (
                <FormattedMessage
                  tagName="p"
                  {...messages.totalCount}
                  values={{ selectedCount, selectedName, selectedResourceName }}
                />
              )}
              <ResponsiveContainer
                height={serie.length > 1 ? serie.length * 50 : 100}
              >
                <BarChart
                  data={convertedSerie}
                  layout="vertical"
                  ref={this.currentChart}
                >
                  <Bar
                    dataKey="value"
                    name={unitName}
                    fill={newBarFill}
                    label={{ fill: barFill, fontSize: chartLabelSize }}
                    barSize={20}
                    animationDuration={animationDuration}
                    animationBegin={animationBegin}
                    isAnimationActive={true}
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
                  <Tooltip
                    isAnimationActive={false}
                    cursor={{ fill: barHoverColor }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const SelectableResourceChartWithHoCs = injectIntl<Props>(
  withTheme(SelectableResourceChart as any) as any
);

export default (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {(serie) => <SelectableResourceChartWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);
