// libraries
import React, { PureComponent } from 'react';
import { map, sortBy } from 'lodash-es';

// components
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { GraphCard, GraphCardInner, GraphCardHeaderWithFilter } from '../..';
import Select from 'components/UI/Select';
import EmptyGraph from '../../components/EmptyGraph';

// styling
import styled, { withTheme } from 'styled-components';

// resources
import GetResourcesByProject from './GetResourcesByProject';
import {
  IIdeasByProject,
  ICommentsByProject,
  IVotesByProject
} from 'services/stats';

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
  max-width: 50%;
  margin-right: 10px;
`;

interface InputProps {
  className: string;
  onResourceByProjectChange: (option: IOption) => void;
  currentResourceByProject: IResource;
  resourceOptions: IOption[];
  startAt: string;
  endAt: string;
  currentProjectFilter: string | null;
  currentGroupFilter: string | null;
  currentTopicFilter: string | null;
  projectOptions: IOption[];
  selectedResource: IResource;
}
interface DataProps {
  serie: IIdeasByProject | ICommentsByProject | IVotesByProject | null;
}
interface Props extends InputProps, DataProps { }

type IGraphFormat = {
  name: any,
  value: any,
  code: any
}[];

interface State {
  serie: IGraphFormat | null;
}

class FilterableBarChartResourceByProject extends PureComponent<Props & InjectedLocalized & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      serie: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.serie) {
      if (this.props.serie !== prevProps.serie) {
        if (this.props.currentProjectFilter) {
          this.setState({
            serie: this.filterByProject(this.convertToGraphFormat(this.props.serie))
          });
        } else {
          this.setState({
            serie: this.convertToGraphFormat(this.props.serie)
          });
        }
      }
      if (this.props.currentProjectFilter !== prevProps.currentProjectFilter) {
        if (this.props.currentProjectFilter) {
          this.setState({
            serie: this.filterByProject(this.convertToGraphFormat(this.props.serie))
          });
        } else {
          this.setState({
            serie: this.convertToGraphFormat(this.props.serie)
          });
        }
      }
    }
  }

  convertToGraphFormat = (serie: IIdeasByProject | IVotesByProject | ICommentsByProject) => {
    if (serie) {
      const { data, projects } = serie;
      const { localize } = this.props;

      const mapped = map(data, (count: number, projectId: string) => ({
        name: localize(projects[projectId].title_multiloc),
        value: count,
        code: projectId,
      }));
      return sortBy(mapped, 'name');
    }

    return null;
  }

  filterByProject = (serie: IGraphFormat | null) => {
    if (serie) {
      const { currentProjectFilter, projectOptions, intl: { formatMessage } } = this.props;
      const selectedProject = serie.find(item => item.code === currentProjectFilter);
      const selectedProjectCount = selectedProject ? selectedProject.value : 0;
      const filteredSerie = serie.map(item => {
        const { value, ...rest } = item;
        return { value: value - selectedProjectCount, ...rest };
      }).filter(item => item.code !== currentProjectFilter);
      let projectName;
      if (selectedProject) {
        projectName = selectedProject.name;
      } else {
        const foundOption = projectOptions.find(option => option.value === currentProjectFilter);
        projectName = foundOption ? foundOption.label : formatMessage(messages.selectedProject);
      }
      filteredSerie.unshift({
        name: projectName,
        value: 0,
        code: currentProjectFilter,
      });
      return filteredSerie;
    }

    return null;
  }

  render() {
    const { serie } = this.state;
    const theme = this.props['theme'];
    const {
      className,
      onResourceByProjectChange,
      currentResourceByProject,
      resourceOptions,
      selectedResource,
      intl: {
        formatMessage
      },
      currentProjectFilter
    } = this.props;
    const isEmpty = !serie || serie.every(item => item.value === 0);
    const unitName = currentProjectFilter && serie
      ? formatMessage(messages.resourceByProjectDifference, {
        resourceName: formatMessage(messages[selectedResource]),
        project: serie[0].name
      })
      : formatMessage(messages[selectedResource]);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeaderWithFilter>
            <SSelect
              id="projectFilter"
              onChange={onResourceByProjectChange}
              value={currentResourceByProject}
              options={resourceOptions}
              clearable={false}
              borderColor="#EAEAEA"
            />
            <FormattedMessage {...messages.byProjectTitle} />
          </GraphCardHeaderWithFilter>
          {!isEmpty ?
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
                  <Tooltip isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            :
            <EmptyGraph unit={selectedResource} />
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}
const ResourceByProjectWithFilterChartHoc = localize<Props>(injectIntl<Props & InjectedLocalized>(withTheme(FilterableBarChartResourceByProject as any) as any));

export default (inputProps: InputProps) => (
  <GetResourcesByProject {...inputProps}>
    {serie => <ResourceByProjectWithFilterChartHoc {...inputProps} {...serie} />}
  </GetResourcesByProject>
);
