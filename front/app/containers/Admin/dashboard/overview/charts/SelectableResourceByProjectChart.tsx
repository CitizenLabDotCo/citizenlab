import React from 'react';

import { map, orderBy } from 'lodash-es';
import moment from 'moment';
import { IOption } from 'typings';

import { ICommentsByProject } from 'api/comments_by_project/types';
import useCommentsByProject from 'api/comments_by_project/useCommentsByProject';
import { IIdeasByProject } from 'api/ideas_by_project/types';
import useIdeasByProject from 'api/ideas_by_project/useIdeasByProject';
import { IReactionsByProject } from 'api/reactions_by_project/types';
import useReactionsByProject from 'api/reactions_by_project/useReactionsByProject';

import useLocalize from 'hooks/useLocalize';

import { IResolution } from 'components/admin/ResolutionControl';

import { IResource } from '..';

import SelectableResourceChart from './SelectableResourceChart';

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
}

interface Props extends QueryProps {
  currentProjectFilter: string | undefined;
  className: string;
  onResourceByProjectChange: (option: IOption) => void;
  currentResourceByProject: IResource;
  resourceOptions: IOption[];
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentProjectFilterLabel: string | undefined;
}

const SelectableResourceByProjectChart = ({
  currentResourceByProject,
  onResourceByProjectChange,
  currentProjectFilter,
  ...otherProps
}: Props) => {
  const startAt = otherProps.startAt
    ? moment(otherProps.startAt).local().format('YYYY-MM-DD')
    : null;
  const endAt = otherProps.endAt
    ? moment(otherProps.endAt).local().format('YYYY-MM-DD')
    : null;
  const { data: ideasByProject } = useIdeasByProject({
    start_at: startAt,
    end_at: endAt,
    enabled: currentResourceByProject === 'ideas',
  });

  const { data: commentsByProject } = useCommentsByProject({
    start_at: startAt,
    end_at: endAt,
    enabled: currentResourceByProject === 'comments',
  });

  const { data: reactionsByProject } = useReactionsByProject({
    start_at: startAt,
    end_at: endAt,
    enabled: currentResourceByProject === 'reactions',
  });

  const localize = useLocalize();

  const convertToGraphFormat = (
    data: IIdeasByProject | IReactionsByProject | ICommentsByProject
  ) => {
    const { series, projects } = data.data.attributes;
    const dataKey =
      currentResourceByProject === 'reactions'
        ? 'total'
        : currentResourceByProject;

    const mapped = map(series[dataKey], (count: number, projectId: string) => ({
      name: localize(projects[projectId].title_multiloc),
      value: count,
      code: projectId,
    }));

    const sortedByValue = orderBy(mapped, 'value', 'desc');
    return sortedByValue.length > 0 ? sortedByValue : null;
  };

  const data: Record<IResource, any> = {
    ideas: ideasByProject,
    comments: commentsByProject,
    reactions: reactionsByProject,
  };

  const serie =
    data[currentResourceByProject] &&
    convertToGraphFormat(data[currentResourceByProject]);

  return (
    <SelectableResourceChart
      onResourceByXChange={onResourceByProjectChange}
      currentSelectedResource={currentResourceByProject}
      currentFilter={currentProjectFilter}
      byWhat="Project"
      serie={serie}
      {...otherProps}
    />
  );
};

export default SelectableResourceByProjectChart;
