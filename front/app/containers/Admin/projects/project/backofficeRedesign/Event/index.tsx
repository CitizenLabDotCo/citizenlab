import React, { useState } from 'react';

import { IProjectData } from 'api/projects/types';

import { useParams } from 'utils/router';

import { usePageSave } from '../_shared/PageSaveContext';

import EventWorkspace from './EventWorkspace';

interface Props {
  project: IProjectData;
}

const Event = ({ project }: Props) => {
  const { id: eventId } = useParams({ strict: false });
  const pageSave = usePageSave();
  const [createdEventId, setCreatedEventId] = useState<string>();

  // A new event moves to its own URL once saved. It keeps the key of the new
  // event page, so the workspace stays mounted and keeps its state.
  const workspaceKey = eventId && eventId !== createdEventId ? eventId : 'new';

  return (
    <EventWorkspace
      key={`${workspaceKey}-${pageSave?.revision}`}
      project={project}
      eventId={eventId}
      onCreate={setCreatedEventId}
    />
  );
};

export default Event;
