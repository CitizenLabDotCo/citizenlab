import React from 'react';

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

  return (
    <EventWorkspace
      key={`${eventId}-${pageSave?.revision}`}
      project={project}
      eventId={eventId}
    />
  );
};

export default Event;
