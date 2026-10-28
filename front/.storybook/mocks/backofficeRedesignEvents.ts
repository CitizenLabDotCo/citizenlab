// Mocks for the stories of the redesigned event page (Event/): a few more
// events than the shared mock has, their attachments, a picture to use as
// an event image, and a harness that gives a card the event form it edits.

import React, { ReactNode, useEffect } from 'react';

import { http, HttpResponse } from 'msw';
import { UploadFile } from 'typings';

import { IEventData } from '../../app/api/events/types';
import { IFileAttachmentData } from '../../app/api/file_attachments/types';
import { IFileData } from '../../app/api/files/types';
import { project1 } from '../../app/api/projects/__mocks__/_mockServer';
import useEventForm, {
  EventForm,
} from '../../app/containers/Admin/projects/_shared/events/useEventForm';

import { backofficeRedesignHandlers, mockEvents } from './backofficeRedesign';

const API = '/web_api/v1';

const iso = (daysFromNow: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const baseEvent = mockEvents[0];

const eventOf = (
  id: string,
  attributes: Partial<IEventData['attributes']>
): IEventData => ({
  ...baseEvent,
  id,
  attributes: { ...baseEvent.attributes, ...attributes },
});

/** An online event with its own register button and no limit. */
export const onlineEvent = eventOf('bo-event-online', {
  title_multiloc: { en: 'Online Q&A with the city gardener' },
  description_multiloc: {
    en: '<p>Ask anything about the tree plan. The gardener answers live.</p>',
  },
  address_1: null,
  location_multiloc: {},
  location_point_geojson: null,
  online_link: 'https://meet.example.org/tree-plan',
  using_url: 'https://forms.example.org/tree-plan-qa',
  attend_button_multiloc: { en: 'Save my seat' },
  maximum_attendees: null,
  attendees_count: 0,
});

/** An event over three days, with a room in the address details. */
export const multiDayEvent = eventOf('bo-event-multiday', {
  title_multiloc: { en: 'Tree planting weekend' },
  address_2_multiloc: { en: 'Meet at the blue tent by the playground' },
  start_at: iso(20, 9),
  end_at: iso(22, 17),
  attendees_count: 41,
  maximum_attendees: 60,
});

/** Long texts everywhere, to see how they wrap. */
export const longEvent = eventOf('bo-event-long', {
  title_multiloc: {
    en: 'Second neighbourhood workshop on where the new trees along the canal and the ring road should be planted first',
  },
  address_1:
    'Koninklijke Academie voor Schone Kunsten, Mutsaardstraat 31, 2000 Antwerpen, Belgium',
  address_2_multiloc: {
    en: 'Second floor, the big room at the end of the corridor, next to the library. The lift is on the left of the main entrance.',
  },
  attendees_count: 128,
});

/** An event with two files attached. */
export const eventWithFiles = eventOf('bo-event-files', {});

const extraEvents = [onlineEvent, multiDayEvent, longEvent, eventWithFiles];

const fileOf = (id: string, name: string, size: number): IFileData => ({
  id,
  type: 'file',
  attributes: {
    title: name,
    name,
    mime_type: 'application/pdf',
    size,
    category: 'info_sheet',
    description_multiloc: {},
    ai_processing_allowed: false,
    created_at: iso(-3, 9),
    updated_at: iso(-3, 9),
    deleted_at: null,
    content: { url: `/files/${name}` },
  },
  relationships: {},
});

export const mockFiles: IFileData[] = [
  fileOf('bo-file-1', 'Tree route map.pdf', 820000),
  fileOf('bo-file-2', 'Planting plan 2026 - draft for residents.pdf', 2400000),
];

export const mockAttachments: IFileAttachmentData[] = mockFiles.map(
  (file, index) => ({
    id: `bo-attachment-${index + 1}`,
    type: 'file_attachment',
    attributes: {
      position: index,
      file_name: file.attributes.name,
      file_size: file.attributes.size,
      file_url: file.attributes.content.url,
      created_at: file.attributes.created_at,
      updated_at: file.attributes.updated_at,
    },
    relationships: {
      attachable: { data: { id: eventWithFiles.id, type: 'event' } },
      file: { data: { id: file.id, type: 'file' } },
    },
  })
);

const eventHandlers = [
  http.get(`${API}/events/:id`, ({ params }) => {
    const event = extraEvents.find((e) => e.id === params.id);
    return event ? HttpResponse.json({ data: event }) : undefined;
  }),
  http.get(`${API}/file_attachments`, ({ request }) => {
    const id = new URL(request.url).searchParams.get('attachable_id');
    return HttpResponse.json({
      data: id === eventWithFiles.id ? mockAttachments : [],
    });
  }),
  http.get(`${API}/files/:id`, ({ params }) =>
    HttpResponse.json({
      data: mockFiles.find((f) => f.id === params.id) ?? mockFiles[0],
    })
  ),
];

/** The shared handlers, with the events and files above in front. */
export const eventStoryHandlers = [
  ...eventHandlers,
  ...backofficeRedesignHandlers,
];

// A park drawn on a canvas: sky, a lawn and a row of trees, 1200 × 800.
let sampleImageCache: UploadFile | null = null;

export const sampleImage = (): UploadFile => {
  if (sampleImageCache) return sampleImageCache;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const sky = ctx.createLinearGradient(0, 0, 0, 520);
  sky.addColorStop(0, '#8fc4e8');
  sky.addColorStop(1, '#dff0fa');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1200, 800);
  ctx.fillStyle = '#7bb661';
  ctx.fillRect(0, 520, 1200, 280);
  [140, 380, 620, 860, 1080].forEach((x, i) => {
    ctx.fillStyle = '#6b4a2b';
    ctx.fillRect(x - 14, 420, 28, 140);
    ctx.fillStyle = i % 2 ? '#3f8a3a' : '#2f7a34';
    ctx.beginPath();
    ctx.arc(x, 380, 110 - (i % 2) * 20, 0, Math.PI * 2);
    ctx.fill();
  });

  const base64 = canvas.toDataURL('image/jpeg', 0.85);
  const bytes = Uint8Array.from(atob(base64.split(',')[1]), (c) =>
    c.charCodeAt(0)
  );
  const file = new File([bytes], 'tree-route-park.jpg', {
    type: 'image/jpeg',
  });
  sampleImageCache = Object.assign(file, {
    base64,
    url: base64,
    remote: false,
    filename: file.name,
  });
  return sampleImageCache;
};

interface HarnessProps {
  /** An existing event; a new event's form when absent. */
  eventId?: string;
  /** An image picked before the story starts. */
  withImage?: boolean;
  children: (form: EventForm) => ReactNode;
}

// Runs the real event form, as the event page does, and hands it to the
// card the story shows.
export const EventFormHarness = ({
  eventId,
  withImage = false,
  children,
}: HarnessProps) => {
  const form = useEventForm({ projectId: project1.id, eventId });
  const { addImage } = form;

  useEffect(() => {
    if (withImage) addImage([sampleImage()]);
    // Once, when the story mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (form.isLoading) return null;
  return React.createElement(React.Fragment, null, children(form));
};
