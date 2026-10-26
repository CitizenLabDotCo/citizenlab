import React, { useEffect } from 'react';

import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import useEventForm from 'containers/Admin/projects/_shared/events/useEventForm';
import eventMessages from 'containers/Admin/projects/project/events/messages';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import ProjectWorkspace from '..';
import { usePageSave, useRegisterPageSaver } from '../_shared/PageSaveContext';
import projectMessages from '../messages';

import EventPreview from './EventPreview';
import EventSetup from './EventSetup';
import messages from './messages';

interface Props {
  project: IProjectData;
  eventId?: string;
  onCreate: (eventId: string) => void;
}

const EventWorkspace = ({ project, eventId, onCreate }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const pageSave = usePageSave();
  const form = useEventForm({ projectId: project.id, eventId, onCreate });

  useRegisterPageSaver('event', { dirty: form.dirty, save: form.save });

  // A new event moves to its own URL once nothing is left to save, so the
  // guard against leaving with unsaved changes doesn't stop it.
  const createdEventId = eventId ? undefined : form.event?.id;
  const settled = !pageSave?.dirty && !pageSave?.saving;
  useEffect(() => {
    if (!createdEventId || !settled || pageSave?.isLeaving()) return;
    // Replace, so going back doesn't open an empty new event form.
    clHistory.replace(`/admin/projects/${project.id}/events/${createdEventId}`);
  }, [createdEventId, settled, pageSave, project.id]);

  if (form.isLoading) return null;

  const title = localize(form.attributes.title_multiloc);
  const fallbackTitle = form.event
    ? messages.untitledEvent
    : projectMessages.newEvent;

  return (
    <ProjectWorkspace
      project={project}
      draft={{
        label: title || formatMessage(fallbackTitle),
        parentLabel: formatMessage(projectMessages.eventsSection),
        saveLabel: formatMessage(
          form.event ? eventMessages.saveButtonLabel : messages.create
        ),
      }}
      sidePanel={<EventSetup projectId={project.id} form={form} />}
    >
      <EventPreview project={project} form={form} />
    </ProjectWorkspace>
  );
};

export default EventWorkspace;
