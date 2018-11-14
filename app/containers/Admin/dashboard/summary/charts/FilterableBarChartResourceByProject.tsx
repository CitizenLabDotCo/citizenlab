// libraries
import React, { PureComponent } from 'react';
import { map, sortBy, isEmpty } from 'lodash-es';

// components
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { GraphCard, NoDataContainer, GraphCardInner, GraphCardHeaderWithFilter } from '../..';
import Select from 'components/UI/Select';

// styling
import styled, { withTheme } from 'styled-components';
import { media } from 'utils/styleUtils';
import { rgba } from 'polished';

// resources
import {
  IIdeasByProject,
  ICommentsByProject,
  IVotesByProject
} from 'services/stats';
import GetParticipationByX from './GetParticipationByX';

// intl
import localize, { InjectedLocalized } from 'utils/localize';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import { IOption } from 'typings';
import { IResource } from '..';

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
interface DataProps {
  serie: IVotesByProject | ICommentsByProject | IIdeasByProject;
}
interface InputProps {
  className: string;
  onResourceByProjectChange: (option: IOption) => void;
  resourceOptions: IOption[];
  startAt: string | null | undefined;
  endAt: string | null;
  currentProjectFilter: string | null;
  currentGroupFilter: string | null;
  currentTopicFilter: string | null;
  selectedResource: IResource;
  projectOptions: IOption[];
}
interface Props extends InputProps, DataProps { }

type IGraphFormat = {
  name: any,
  value: any,
  code: any
}[];

interface State {
  serie: IGraphFormat | null;
  totalCount: number | null;
  projectName: string | null;
}

interface PropsWithHoCs extends Props, InjectedIntlProps, InjectedLocalized { }

class FilterableBarChartResourceByProject extends PureComponent<PropsWithHoCs, State> {
  constructor(props: PropsWithHoCs) {
    super(props);
    this.state = {
      serie: null,
      totalCount: null,
      projectName: null,
    };
  }

  componentDidMount() {
    this.setConvertedSerieToState();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.serie !== this.props.serie
      || this.props.currentProjectFilter !== prevProps.currentProjectFilter) {
      this.setConvertedSerieToState();
    }
  }

  setConvertedSerieToState() {
    const { serie } = this.props;
    const convertedSerie = serie && this.convertToGraphFormat(this.props.serie);
    if (this.props.currentProjectFilter) {
      this.setState({ serie: this.filterByProject(convertedSerie) });
    } else { this.setState({ serie: convertedSerie }); }
  }

  convertToGraphFormat = (serie: IIdeasByProject | IVotesByProject | ICommentsByProject) => {
    const { data, projects } = serie;
    const { localize } = this.props;

    const mapped = map(data, (count: number, projectId: string) => ({
      name: localize(projects[projectId].title_multiloc),
      value: count,
      code: projectId,
    }));

    if (mapped.length > 0) {
      return sortBy(mapped, 'name');
    }

    return null;
  }

  filterByProject = (serie: IGraphFormat | null) => {
    if (serie) {
      const { currentProjectFilter, projectOptions, intl: { formatMessage } } = this.props;
      const selectedProject = serie.find(item => item.code === currentProjectFilter);
      const selectedProjectCount = selectedProject ? selectedProject.value : 0;
      this.setState({ totalCount: selectedProjectCount });
      if (selectedProject) {
        this.setState({ projectName: selectedProject.name });
      } else {
        const foundOption = projectOptions.find(option => option.value === currentProjectFilter);
        this.setState({ projectName: foundOption ? foundOption.label : formatMessage(messages.selectedProject) });
      }
      const filteredSerie = serie.map(item => {
        const { value, ...rest } = item;
        return { value: value - selectedProjectCount, ...rest };
      }).filter(item => item.code !== currentProjectFilter);
      return filteredSerie;
    }

    return null;
  }

  render() {
    const theme = this.props['theme'];
    const { chartFill } = theme;
    const { serie, totalCount, projectName } = this.state;
    const {
      className,
      onResourceByProjectChange,
      resourceOptions,
      selectedResource,
      intl: {
        formatMessage
      },
      currentProjectFilter
    } = this.props;
    const noData = (serie && (serie.every(item => isEmpty(item)) || serie.length <= 0)) || false;
    const selectedResourceName = formatMessage(messages[selectedResource]);
    const unitName = (currentProjectFilter && serie && !noData)
      ? formatMessage(messages.resourceByProjectDifference, {
        resourceName: selectedResourceName,
        project: projectName
      })
      : selectedResourceName;
    const barHoverColor = rgba(chartFill, .25);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeaderWithFilter>
            <GraphCardTitle>
              <FormattedMessage {...messages.participationPerProject} />
            </GraphCardTitle>
            <SSelect
              id="projectFilter"
              onChange={onResourceByProjectChange}
              value={selectedResource}
              options={resourceOptions}
              clearable={false}
              borderColor="#EAEAEA"
            />
          </GraphCardHeaderWithFilter>
          {noData ?
            <NoDataContainer>
              {currentProjectFilter ?
                <FormattedMessage {...messages.totalCountProject} values={{ totalCount, projectName, selectedResourceName }} />
                : <FormattedMessage {...messages.noData} />}
            </NoDataContainer>
            :
            <>
              {currentProjectFilter && <FormattedMessage tagName="p" {...messages.totalCountProject} values={{ totalCount, projectName, selectedResourceName }} />}
              <ResponsiveContainer width="100%" height={serie && (serie.length * 50)}>
                <BarChart data={serie} layout="vertical">
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
              </ResponsiveContainer>
            </>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const BarChartWithHocs = localize<Props>(injectIntl<Props & InjectedLocalized>(withTheme(FilterableBarChartResourceByProject as any) as any));

export default (inputProps: InputProps) => (
  <GetParticipationByX {...inputProps} type="ByProject">
    {serie => <BarChartWithHocs {...serie} {...inputProps} />}
  </GetParticipationByX>
);
