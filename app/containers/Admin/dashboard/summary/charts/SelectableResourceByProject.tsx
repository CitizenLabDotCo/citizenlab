// libraries
import React, { PureComponent } from 'react';
import { map, sortBy } from 'lodash-es';

// components
import SelectableResourceChart from './SelectableResourceChart';

// intl
import localize, { InjectedLocalized } from 'utils/localize';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import {
IIdeasByProject,
ideasByProjectStream,
ICommentsByProject,
commentsByProjectStream,
IVotesByProject,
votesByProjectStream
} from 'services/stats';
import { IOption, IGraphFormat } from 'typings';
import { IResource } from '..';

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
  currentTopicFilter: string | null;
  currentGroupFilter: string | null;
}

interface InputProps {
  currentProjectFilter: string | null;
  className: string;
  onResourceByProjectChange: (option: IOption) => void;
  currentResourceByProject: IResource;
  resourceOptions: IOption[];
  projectOptions: IOption[];
}

interface Props extends InputProps, QueryProps { }

interface PropsWithHoCs extends Props, InjectedIntlProps, InjectedLocalized { }

class SelectableResourceByProject extends PureComponent<PropsWithHoCs> {
  convertToGraphFormat = (data: IIdeasByProject | IVotesByProject | ICommentsByProject) => {
    const { series, projects } = data;
    const { localize, currentResourceByProject } = this.props;
    const dataKey = currentResourceByProject === 'votes' ? 'total' : currentResourceByProject;

    const mapped = map(series[dataKey], (count: number, projectId: string) => ({
      name: localize(projects[projectId].title_multiloc) as string,
      value: count as number,
      code: projectId as string,
    }));
    const res = sortBy(mapped, 'name');
    return res.length > 0 ? res : null;
  }

  convertSerie = (serie: IGraphFormat | null) => {
    const { currentProjectFilter, currentResourceByProject, projectOptions, intl: { formatMessage } } = this.props;
    if (serie && currentResourceByProject) {
      const selectedProject = serie.find(item => item.code === currentProjectFilter);
      const selectedCount = selectedProject ? selectedProject.value : 0;

      let selectedName;
      if (selectedProject) {
        selectedName = selectedProject.name;
      } else {
        const foundOption = projectOptions.find(option => option.value === currentProjectFilter);
        selectedName = foundOption ? foundOption.label : formatMessage(messages.selectedProject);
      }

      const convertedSerie = serie.map(item => {
        const { value, ...rest } = item;
        return { value: value - selectedCount, ...rest };
      }).filter(item => item.code !== currentProjectFilter);

      return { convertedSerie, selectedCount, selectedName };
    }
    return ({ convertedSerie: serie, selectedCount: null, selectedName: null });
  }

  getCurrentStream(currentResourceByProject) {
    if (currentResourceByProject === 'ideas') {
      return ideasByProjectStream;
    } else if (currentResourceByProject === 'comments') {
      return commentsByProjectStream;
    } else {
      return votesByProjectStream;
    }
  }

  render() {
    const { currentResourceByProject, currentProjectFilter, onResourceByProjectChange } = this.props;
    return (
      <SelectableResourceChart
        {...this.props}
        onResourceByXChange={onResourceByProjectChange}
        currentSelectedResource={currentResourceByProject}
        stream={this.getCurrentStream(currentResourceByProject)}
        convertToGraphFormat={this.convertToGraphFormat}
        convertSerie={this.convertSerie}
        currentFilter={currentProjectFilter}
        graphTitleMessageKey="participationPerProject"
      />
    );
  }
}

export default localize<Props>(injectIntl<Props & InjectedLocalized>(SelectableResourceByProject as any) as any);
