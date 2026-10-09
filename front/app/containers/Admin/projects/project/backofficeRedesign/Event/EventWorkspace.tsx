import React from 'react';

import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import eventMessages from 'containers/Admin/projects/project/events/messages';
import useEventForm from 'containers/Admin/projects/project/events/useEventForm';

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
}

const EventWorkspace = ({ project, eventId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const pageSave = usePageSave();
  const form = useEventForm({ projectId: project.id, eventId });

  useRegisterPageSaver('event', {
    dirty: form.dirty,
    save: async (reason) => {
      await form.save();
      if (reason === 'button') {
        pageSave?.leave();
        clHistory.push(`/admin/projects/${project.id}`);
      }
    },
  });

  if (form.isLoading) return null;

  const title = localize(form.attributes.title_multiloc);
  const fallbackTitle = eventId
    ? messages.untitledEvent
    : projectMessages.newEvent;

  return (
    <ProjectWorkspace
      project={project}
      draft={{
        label: title || formatMessage(fallbackTitle),
        parentLabel: formatMessage(projectMessages.eventsSection),
        saveLabel: formatMessage(
          eventId ? eventMessages.saveButtonLabel : messages.create
        ),
      }}
      sidePanel={<EventSetup projectId={project.id} form={form} />}
    >
      <EventPreview project={project} form={form} />
    </ProjectWorkspace>
  );
};

export default EventWorkspace;
