import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import eventsKeys from 'api/events/keys';
import { IEvent, IEventProperties } from 'api/events/types';
import useAddEvent from 'api/events/useAddEvent';
import useEvent from 'api/events/useEvent';
import useUpdateEvent from 'api/events/useUpdateEvent';

import { isCLErrorsWrapper } from 'utils/errorUtils';

import { SubmitState } from './types';
import useEventFormAttachments from './useEventFormAttachments';
import useEventFormImage from './useEventFormImage';
import useEventFormLocation from './useEventFormLocation';
import { initializeEventTimes } from './utils';

interface QueuedSave {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

const createQueuedSave = (): QueuedSave => {
  let resolve: () => void = () => {};
  let reject: (error: unknown) => void = () => {};
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

interface Options {
  projectId: string;
  /** Absent for an event that isn't created yet. */
  eventId?: string;
  onCreate?: (eventId: string) => void;
}

// The form state of an event. The values a user hasn't touched yet are
// `undefined`, so they fall back to the saved event.
const useEventForm = ({ projectId, eventId, onCreate }: Options) => {
  const [createdEventId, setCreatedEventId] = useState<string>();
  const currentEventId = eventId ?? createdEventId;

  const { data: event, isLoading } = useEvent(currentEventId);
  const queryClient = useQueryClient();

  const { mutateAsync: addEvent } = useAddEvent();
  const { mutateAsync: updateEvent } = useUpdateEvent();

  const [status, setStatus] = useState<SubmitState>('disabled');
  const [saving, setSaving] = useState(false);
  const pendingSave = useRef<Promise<void> | null>(null);
  const queuedSave = useRef<QueuedSave | null>(null);
  const editCount = useRef(0);
  const savedEditCount = useRef(0);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [attributeDiff, setAttributeDiff] = useState<IEventProperties>(() =>
    eventId ? {} : initializeEventTimes()
  );
  const [customButtonToggle, setCustomButtonToggle] = useState<boolean>();

  const markDirty = () => {
    editCount.current += 1;
    setStatus('enabled');
    setErrors(null);
  };

  const savedAttributes = event?.data.attributes;
  const attributes = { ...savedAttributes, ...attributeDiff };

  const { files, saveAttachments } = useEventFormAttachments({
    projectId,
    eventId: currentEventId,
    markDirty,
  });
  const { saveImage, ...imageFields } = useEventFormImage({
    event,
    markDirty,
  });
  const { locationPointToSave, markPointSaved, ...locationFields } =
    useEventFormLocation({
      changedAddress: attributeDiff.address_1,
      savedPoint: savedAttributes?.location_point_geojson ?? null,
      markDirty,
    });

  const updateAttributeDiff: Dispatch<SetStateAction<IEventProperties>> = (
    update
  ) => {
    markDirty();
    setAttributeDiff(update);
  };

  const updateAttributes = (changes: IEventProperties) =>
    updateAttributeDiff((diff) => ({ ...diff, ...changes }));

  const registrationLimitOn = typeof attributes.maximum_attendees === 'number';
  const customButtonOn = customButtonToggle ?? !!attributes.using_url;

  // Two saves at once would create a new event twice, so a save asked for
  // while another runs is queued until that one ends.
  const save = () => {
    if (!pendingSave.current) {
      pendingSave.current = saveChanges();
      return pendingSave.current;
    }
    queuedSave.current ??= createQueuedSave();
    return queuedSave.current.promise;
  };

  // The queued save runs only after the re-render that follows the first
  // save, so it reads the state that save left behind, like the id of the
  // event it created.
  useEffect(() => {
    const queued = queuedSave.current;
    if (saving || pendingSave.current || !queued) return;

    queuedSave.current = null;
    if (editCount.current === savedEditCount.current) {
      queued.resolve();
    } else {
      save().then(queued.resolve, queued.reject);
    }
  });

  const saveChanges = async () => {
    setSaving(true);
    setErrors(null);
    const editsAtStart = editCount.current;

    try {
      const point = await locationPointToSave();
      const changes: IEventProperties = {
        ...attributeDiff,
        ...(point !== undefined && {
          location_point_geojson: attributes.address_1 ? point : null,
        }),
      };

      const showSaved = (saved: IEvent) =>
        queryClient.setQueryData(eventsKeys.item({ id: saved.data.id }), saved);

      let savedEventId = currentEventId;
      if (!savedEventId) {
        const created = await addEvent({ projectId, event: changes });
        showSaved(created);
        savedEventId = created.data.id;
        setCreatedEventId(savedEventId);
        onCreate?.(savedEventId);
      } else if (Object.keys(changes).length > 0) {
        // Only the image or files may have changed, and the API refuses an
        // empty update.
        showSaved(await updateEvent({ eventId: savedEventId, event: changes }));
      }

      await Promise.all([
        saveAttachments(savedEventId),
        saveImage(savedEventId),
      ]);

      setAttributeDiff((diff) => (diff === attributeDiff ? {} : diff));
      markPointSaved(point);

      savedEditCount.current = editsAtStart;
      // Edits made during the save weren't sent, so the form stays unsaved.
      if (editCount.current === editsAtStart) setStatus('success');
    } catch (error) {
      setErrors(
        isCLErrorsWrapper(error)
          ? error.errors
          : { base: [{ error: 'unknown' }] }
      );
      setStatus('error');
      throw error;
    } finally {
      pendingSave.current = null;
      setSaving(false);
    }
  };

  return {
    event: event?.data,
    // Only the first load of an existing event; loading the event just
    // created must not unmount the form.
    isLoading: !!eventId && isLoading,
    attributes,
    errors,
    status,
    saving,
    dirty: status === 'enabled' || status === 'error',
    save,
    updateAttributes,
    updateAttributeDiff,

    registrationLimitOn,
    toggleRegistrationLimit: () =>
      updateAttributes({ maximum_attendees: registrationLimitOn ? null : 100 }),
    // An empty field counts as 0.
    setMaximumAttendees: (value: string) =>
      updateAttributes({ maximum_attendees: Number(value) }),
    customButtonOn,
    toggleCustomButton: () => {
      setCustomButtonToggle(!customButtonOn);
      updateAttributes({ using_url: '' });
    },

    ...imageFields,
    ...locationFields,
    files,
  };
};

export type EventForm = ReturnType<typeof useEventForm>;

export default useEventForm;
