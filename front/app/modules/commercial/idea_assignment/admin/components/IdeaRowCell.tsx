import React, { FC, useEffect } from 'react';

import AssigneeSelect from 'components/admin/PostManager/components/PostTable/AssigneeSelect';
import {
  InsertConfigurationOptions,
  CellConfiguration,
  Override,
} from 'typings';
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/admin/PostManager/tracks';

import { IdeaCellComponentProps } from 'components/admin/PostManager/components/PostTable/Row/IdeaRow';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import { IIdeaData } from 'api/ideas/types';

type Props = {
  onData: (
    data: InsertConfigurationOptions<CellConfiguration<IdeaCellComponentProps>>
  ) => void;
};

const IdeaRowCell: FC<Props> = ({ onData }) => {
  const { mutate: updateIdea } = useUpdateIdea();
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

            updateIdea({
              id: ideaId,
              requestBody: { assignee_id: assigneeId || null },
            });

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
                projectId={idea.relationships.project.data.id}
                assigneeId={idea.relationships.assignee?.data?.id}
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
