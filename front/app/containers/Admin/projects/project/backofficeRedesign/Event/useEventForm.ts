import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CLErrors } from 'typings';

import eventsKeys from 'api/events/keys';
import { IEvent, IEventProperties } from 'api/events/types';
import useAddEvent from 'api/events/useAddEvent';
import useEvent from 'api/events/useEvent';
import useUpdateEvent from 'api/events/useUpdateEvent';

import useEventFormAttachments from 'containers/Admin/projects/_shared/events/useEventFormAttachments';
import useEventFormImage from 'containers/Admin/projects/_shared/events/useEventFormImage';
import useEventFormLocation from 'containers/Admin/projects/_shared/events/useEventFormLocation';
import { initializeEventTimes } from 'containers/Admin/projects/_shared/events/utils';

import { isCLErrorsWrapper } from 'utils/errorUtils';

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

// The form holds only the attributes changed since the last save; the others
// come from the saved event.
const useEventForm = ({ projectId, eventId, onCreate }: Options) => {
  const [createdEventId, setCreatedEventId] = useState<string>();
  const currentEventId = eventId ?? createdEventId;

  const { data: event, isLoading } = useEvent(currentEventId);
  const queryClient = useQueryClient();

  const { mutateAsync: addEvent } = useAddEvent();
  const { mutateAsync: updateEvent } = useUpdateEvent();

  const {
    watch,
    getValues,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<{ changes: IEventProperties }>({
    defaultValues: { changes: eventId ? {} : initializeEventTimes() },
  });
  const changes = watch('changes');

  const [saving, setSaving] = useState(false);
  const pendingSave = useRef<Promise<void> | null>(null);
  const queuedSave = useRef<QueuedSave | null>(null);
  const editCount = useRef(0);
  const savedEditCount = useRef(0);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  // The image, files and map point aren't attributes of the event.
  const [otherChanges, setOtherChanges] = useState(false);
  const [customButtonToggle, setCustomButtonToggle] = useState<boolean>();

  const countEdit = () => {
    editCount.current += 1;
    setErrors(null);
  };

  const markDirty = () => {
    countEdit();
    setOtherChanges(true);
  };

  const savedAttributes = event?.data.attributes;
  const attributes = { ...savedAttributes, ...changes };

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
      changedAddress: changes.address_1,
      savedPoint: savedAttributes?.location_point_geojson ?? null,
      markDirty,
    });

  const updateAttributeDiff: Dispatch<SetStateAction<IEventProperties>> = (
    update
  ) => {
    countEdit();
    setValue(
      'changes',
      typeof update === 'function' ? update(getValues('changes')) : update,
      { shouldDirty: true }
    );
  };

  const updateAttributes = (newChanges: IEventProperties) =>
    updateAttributeDiff((changes) => ({ ...changes, ...newChanges }));

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
    const sentChanges = getValues('changes');

    try {
      const point = await locationPointToSave();
      const eventChanges: IEventProperties = {
        ...sentChanges,
        ...(point !== undefined && {
          location_point_geojson: attributes.address_1 ? point : null,
        }),
      };

      const showSaved = (saved: IEvent) =>
        queryClient.setQueryData(eventsKeys.item({ id: saved.data.id }), saved);

      let savedEventId = currentEventId;
      if (!savedEventId) {
        const created = await addEvent({ projectId, event: eventChanges });
        showSaved(created);
        savedEventId = created.data.id;
        setCreatedEventId(savedEventId);
        onCreate?.(savedEventId);
      } else if (Object.keys(eventChanges).length > 0) {
        // Only the image or files may have changed, and the API refuses an
        // empty update.
        showSaved(
          await updateEvent({ eventId: savedEventId, event: eventChanges })
        );
      }

      await Promise.all([
        saveAttachments(savedEventId),
        saveImage(savedEventId),
      ]);

      // Changing an attribute replaces the changes, so the same object means
      // none changed during the save.
      if (getValues('changes') === sentChanges) reset({ changes: {} });
      markPointSaved(point);

      savedEditCount.current = editsAtStart;
      // Edits made during the save weren't sent, so the form stays unsaved.
      if (editCount.current === editsAtStart) setOtherChanges(false);
    } catch (error) {
      setErrors(
        isCLErrorsWrapper(error)
          ? error.errors
          : { base: [{ error: 'unknown' }] }
      );
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
    saving,
    dirty: isDirty || otherChanges,
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
