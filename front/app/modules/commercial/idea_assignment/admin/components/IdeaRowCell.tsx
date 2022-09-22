import { get } from 'lodash-es';
import React, { FC, useEffect } from 'react';

import AssigneeSelect from 'components/admin/PostManager/components/PostTable/AssigneeSelect';
import tracks from 'components/admin/PostManager/tracks';
import { IIdeaData, updateIdea } from 'services/ideas';
import {
  CellConfiguration,
  InsertConfigurationOptions,
  Override,
} from 'typings';
import { trackEventByName } from 'utils/analytics';

import { IdeaCellComponentProps } from 'components/admin/PostManager/components/PostTable/IdeaRow';

type Props = {
  onData: (
    data: InsertConfigurationOptions<CellConfiguration<IdeaCellComponentProps>>
  ) => void;
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
          }: Override<
            IdeaCellComponentProps,
            {
              onChange: (idea: IIdeaData) => (assigneeId?: string) => void;
            }
          >) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default IdeaRowCell;
