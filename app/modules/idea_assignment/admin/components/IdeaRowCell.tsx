import React, { FC, useEffect } from 'react';
import { get } from 'lodash-es';

import AssigneeSelect from 'components/admin/PostManager/components/PostTable/AssigneeSelect';
import { IIdeaData, updateIdea } from 'services/ideas';
import {
  InsertConfigurationOptions,
  CellConfiguration,
  CellComponentProps,
} from 'typings';
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/admin/PostManager/tracks';

type Props = {
  onData: (data: InsertConfigurationOptions<CellConfiguration>) => void;
};

const IdeaRowCell: FC<Props> = ({ onData }) => {
  useEffect(
    () =>
      onData({
        configuration: {
          name: 'assignee',
          cellProps: {
            onClick: (event: Event) => {
              event.preventDefault();
              event.stopPropagation();
            },
            singleLine: true,
          },
          onChange: (idea: IIdeaData) => (assigneeId: string | undefined) => {
            const ideaId = idea.id;
            console.log({ ideaId, assigneeId });

            updateIdea(ideaId, { assignee_id: assigneeId || null });

            trackEventByName(tracks.changeIdeaAssignment, {
              location: 'Idea Manager',
              method: 'Changed through the dropdown n the table overview',
              idea: ideaId,
            });
          },
          Component: ({
            idea,
            onChange,
          }: CellComponentProps & {
            onChange: (idea: IIdeaData) => (assigneeId?: string) => void;
          }) => {
            return (
              <AssigneeSelect
                onAssigneeChange={onChange(idea)}
                projectId={get(idea, 'relationships.project.data.id')}
                assigneeId={get(idea, 'relationships.assignee.data.id')}
              />
            );
          },
        },
        insertAfterName: 'title',
      }),
    []
  );
  return null;
};

export default IdeaRowCell;
