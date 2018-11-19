import React, { PureComponent } from 'react';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import styled, { withTheme } from 'styled-components';
import { media } from 'utils/styleUtils';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { IStreamParams, IStream } from 'utils/streams';
import messages from '../../messages';
import { rgba } from 'polished';
import GetSerieFromStream from 'resources/GetSerieFromStream';
import {
  IIdeasByTopic,
  ICommentsByTopic,
  IVotesByTopic,
  IIdeasByProject,
  ICommentsByProject,
  IVotesByProject,
} from 'services/stats';

// typings
import { IResource } from '..';
import { IGraphFormat, IOption } from 'typings';

// components
import { GraphCard, NoDataContainer, GraphCardInner, GraphCardHeaderWithFilter } from '../..';
import Select from 'components/UI/Select';

const SSelect = styled(Select)`
  flex: 1;

  ${media.smallerThan1280px`
    width: 100%;
  `}
`;

const GraphCardTitle = styled.h3`
  margin: 0;
  margin-right: 15px;

  ${media.smallerThan1280px`
    margin-bottom: 15px;
  `}
`;

export type IGraphFormat = {
  name: string | number,
  value: number,
  code: string
}[] | null;

interface DataProps {
  serie: IGraphFormat;
}

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
  currentProjectFilter?: string | null;
  currentGroupFilter?: string | null;
  currentTopicFilter?: string | null;
  stream: (streamParams?: IStreamParams | null) => IStream<IIdeasByTopic | IVotesByTopic | ICommentsByTopic | IIdeasByProject | IVotesByProject | ICommentsByProject>;
  convertToGraphFormat: (resource: IIdeasByTopic | IVotesByTopic | ICommentsByTopic | IIdeasByProject | IVotesByProject | ICommentsByProject) => IGraphFormat | null;
  currentFilter: string | null;
  graphTitleMessageKey: string;
}

interface InputProps extends QueryProps {
  convertSerie: (serie: IGraphFormat | null) => { convertedSerie: IGraphFormat | null, selectedCount: any, selectedName: any };
  className?: string;
  onResourceByXChange: (option: IOption) => void;
  currentSelectedResource: IResource;
  resourceOptions: IOption[];
}

interface Props extends InputProps, DataProps { }

class FilterableBarChart extends PureComponent<Props & InjectedIntlProps> {
  render() {
    const theme = this.props['theme'];
    const { chartFill } = theme;
    const {
      className,
      onResourceByXChange,
      currentSelectedResource,
      resourceOptions,
      intl: {
        formatMessage
      },
      currentFilter,
      graphTitleMessageKey,
      convertSerie,
      serie
    } = this.props;
    console.log(convertSerie);
    const selectedResourceName = currentSelectedResource && formatMessage(messages[currentSelectedResource]);
    const { convertedSerie, selectedCount, selectedName } = convertSerie(serie);
    const unitName = (currentFilter && serie)
      ? formatMessage(messages.resourceByDifference, {
        selectedResourceName,
        selectedName
      })
      : selectedResourceName;
    const barHoverColor = rgba(chartFill, .25);
    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeaderWithFilter>
            <GraphCardTitle>
              <FormattedMessage {...messages[graphTitleMessageKey]} />
            </GraphCardTitle>
            <SSelect
              id="topicFilter"
              onChange={onResourceByXChange}
              value={currentSelectedResource}
              options={resourceOptions}
              clearable={false}
              borderColor="#EAEAEA"
            />
          </GraphCardHeaderWithFilter>
          {!serie ?
            <NoDataContainer>
              {currentFilter ?
                <FormattedMessage
                  {...messages.totalCount}
                  values={{ selectedCount, selectedName, selectedResourceName }}
                />
                : <FormattedMessage {...messages.noData} />
              }
            </NoDataContainer>
            :
            <>
              {currentFilter && <FormattedMessage tagName="p" {...messages.totalCount} values={{ selectedCount, selectedName, selectedResourceName }} />}
              <ResponsiveContainer width="100%" height={serie && (serie.length * 50)} >
                <BarChart data={convertedSerie} layout="vertical">
                  <Bar
                    dataKey="value"
                    name={unitName}
                    fill={theme.chartFill}
                    label={{ fill: theme.barFill, fontSize: theme.chartLabelSize }}
                    barSize={20}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    stroke={theme.chartLabelColor}
                    fontSize={theme.chartLabelSize}
                    tickLine={false}
                  />
                  <XAxis
                    stroke={theme.chartLabelColor}
                    fontSize={theme.chartLabelSize}
                    type="number"
                    tick={{ transform: 'translate(0, 7)' }}
                  />
                  <Tooltip
                    isAnimationActive={false}
                    cursor={{ fill: barHoverColor }}
                  />
                </BarChart>
              </ResponsiveContainer >
            </>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const FilterableBarChartWithHoCs = injectIntl<Props>(withTheme(FilterableBarChart as any) as any);

export default (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {serie => <FilterableBarChartWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);
