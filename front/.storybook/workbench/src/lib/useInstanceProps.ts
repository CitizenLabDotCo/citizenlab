// The session's instance prop edits (lib/instanceProps.ts): kept in state,
// localStorage and the hash's `p`, sent to every canvas frame over its
// Storybook channel, checked against the components' own argTypes. The
// frames render the change in place: no reload.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  decodeInstanceEdits,
  editKey,
  editStatus,
  framePayload,
  InstanceEdit,
  PARAM,
  payloadOfHash,
  parseStoredEdits,
  propSpecs,
  PropSpec,
  putEdit,
  REPORT_EVENT,
  SET_EVENT,
  specError,
  StoryReport,
  STORAGE_KEY,
  verdictOf,
  withInstanceEdits,
} from './instanceProps';
import { storyOfComponent } from './nesting';
import { isOwnShare, writeShare } from './shareEntry';
import type { ArgType } from './preview';
import { channelOf, loadArgTypes } from './preview';
import type { StoryGroup } from './stories';

type Start = { edits: InstanceEdit[]; error?: string };

const readStorage = () => {
  try {
    return parseStoredEdits(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
};

const writeStorage = (edits: InstanceEdit[]) => {
  try {
    if (edits.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
    } else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Not kept; the hash still carries them.
  }
};

const sameEdits = (a: InstanceEdit[], b: InstanceEdit[]) =>
  a.length === b.length &&
  a.every(
    (e, i) => editKey(e) === editKey(b[i]) && Object.is(e.value, b[i].value)
  );

// A valid link replaces the stored session; a bad one changes nothing.
const initial = (): Start => {
  const stored = readStorage();
  const payload = payloadOfHash(window.location.hash);
  // A reload of an entry the session wrote: the store is newer.
  if (!payload || isOwnShare(window.history.state, PARAM, payload)) {
    return { edits: stored };
  }
  const link = decodeInstanceEdits(payload);
  return link.error ? { edits: stored, error: link.error } : link;
};

const notApplied = (error: string) =>
  `The prop edits of this link were not applied: ${error}.`;

const writeHash = (hash: string, edits: InstanceEdit[]) =>
  writeShare(PARAM, withInstanceEdits(hash, edits));

type Report = StoryReport;

// A copy of `record` with `key` set, without a prototype.
const withKey = <T>(
  record: Partial<Record<string, T>>,
  key: string,
  value: T
): Partial<Record<string, T>> =>
  Object.assign(Object.create(null), record, { [key]: value });

const isReport = (v: unknown): v is Report =>
  !!v &&
  typeof v === 'object' &&
  typeof (v as Report).storyId === 'string' &&
  Array.isArray((v as Report).instances);

export const useInstanceProps = (
  frames: (Window | null)[],
  loads: number,
  groups: StoryGroup[] | null
) => {
  const [start] = useState(initial);
  const [edits, setEdits] = useState<InstanceEdit[]>(start.edits);
  const [notice, setNotice] = useState(
    start.error ? notApplied(start.error) : undefined
  );
  const [report, setReport] = useState<Report | null>(null);
  // Counts reports: what the canvas renders changed.
  const [revision, setRevision] = useState(0);
  const [argTypes, setArgTypes] = useState<
    Partial<Record<string, Record<string, ArgType> | null>>
  >(() => Object.create(null));
  const current = useRef(edits);
  current.current = edits;

  // State to storage and hash. replaceState fires no hashchange.
  useEffect(() => {
    writeStorage(edits);
    writeHash(window.location.hash, edits);
  }, [edits]);

  // A pasted link, or a navigation that dropped `p` or went back to an
  // entry the session wrote (its value is older).
  useEffect(() => {
    const onChange = () => {
      const hash = window.location.hash;
      const payload = payloadOfHash(hash);
      if (!payload || isOwnShare(window.history.state, PARAM, payload)) {
        writeHash(hash, current.current);
        return;
      }
      const link = decodeInstanceEdits(payload);
      if (link.error) {
        setNotice(notApplied(link.error));
        writeHash(hash, current.current);
        return;
      }
      if (!sameEdits(link.edits, current.current)) setEdits(link.edits);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  // What the first frame renders, as its instances report it.
  const frame = frames[0];
  useEffect(() => {
    setReport(null);
    const channel = channelOf(frame);
    if (!channel) return undefined;
    let seen = '';
    const take = (payload: unknown) => {
      if (!isReport(payload)) return;
      const next = {
        storyId: payload.storyId,
        instances: payload.instances
          .filter((i) => i.index >= 0)
          .sort((a, b) =>
            a.name === b.name ? a.index - b.index : a.name < b.name ? -1 : 1
          ),
      };
      // The same report again (a render that changed nothing): no news.
      const text = JSON.stringify(next);
      if (text === seen) return;
      seen = text;
      setReport(next);
      setRevision((n) => n + 1);
    };
    const last = channel.last?.(REPORT_EVENT);
    if (last) take(last[0]);
    channel.on(REPORT_EVENT, take);
    return () => channel.off(REPORT_EVENT, take);
  }, [frame, loads]);

  // The argTypes of every component a report or an edit names, from the
  // component's own story.
  const names = useMemo(() => {
    const out = new Set(edits.map((e) => e.component));
    report?.instances.forEach((i) => out.add(i.name));
    return [...out].sort();
  }, [edits, report]);
  const pending = useRef(new Set<string>());
  useEffect(() => {
    if (!frame || !groups) return;
    names
      .filter((n) => !(n in argTypes) && !pending.current.has(n))
      .forEach((name) => {
        const story = storyOfComponent(groups, name);
        if (!story) {
          setArgTypes((all) => withKey(all, name, null));
          return;
        }
        pending.current.add(name);
        void loadArgTypes(frame, story.storyId).then((types) => {
          pending.current.delete(name);
          // Not reachable yet: tried again with the next frame or load.
          if (types) setArgTypes((all) => withKey(all, name, types));
        });
      });
  }, [names, frame, loads, groups, argTypes]);

  // The instance properties each component offers, as its argTypes
  // describe them: the ones its instances declare once one has reported
  // (kept across stories: a component declares the same ones everywhere),
  // else every enum and boolean of its argTypes, so an edit of a story not
  // on screen is still checked. A component without a story offers none.
  const declaredRef = useRef<Map<string, string[]>>(new Map());
  const declared = useMemo(() => {
    report?.instances.forEach((i) => {
      if (!declaredRef.current.has(i.name)) {
        declaredRef.current.set(i.name, Object.keys(i.props));
      }
    });
    return new Map(declaredRef.current);
  }, [report]);
  const specs = useMemo(() => {
    const out: Partial<Record<string, PropSpec[]>> = Object.create(null);
    Object.entries(argTypes).forEach(([name, types]) => {
      if (types === undefined) return;
      out[name] =
        types === null
          ? []
          : propSpecs(types, declared.get(name) ?? Object.keys(types));
    });
    return out;
  }, [argTypes, declared]);

  // An edit the argTypes refuse is dropped, with a word; an edit learns
  // what the instance rendered before it.
  useEffect(() => {
    const bad = edits.filter((e) => verdictOf(e, specs) === 'bad');
    if (bad.length) {
      const e = bad[0];
      const why = specError(
        specs[e.component]?.find((s) => s.name === e.prop),
        e.value
      );
      setNotice(
        `A prop edit was dropped: ${e.component} ${e.prop} is ${
          why ?? 'not allowed'
        }.`
      );
    }
    let next = edits.filter((e) => !bad.includes(e));
    if (report) {
      next.forEach((e) => {
        if (e.from !== undefined || e.storyId !== report.storyId) return;
        const r = report.instances.find(
          (i) => i.name === e.component && i.index === e.index
        );
        if (r && e.prop in r.base) {
          next = putEdit(
            next.filter((x) => x !== e),
            { ...e, from: r.base[e.prop] }
          );
        }
      });
    }
    if (next.length !== edits.length || next.some((e, i) => e !== edits[i])) {
      setEdits(next);
    }
  }, [edits, specs, report]);

  // The checked edits to every shown frame, now and after each render
  // (a frame that just loaded has not listened yet).
  const payload = useMemo(
    () =>
      JSON.stringify(
        framePayload(edits.filter((e) => verdictOf(e, specs) === 'ok'))
      ),
    [edits, specs]
  );
  useEffect(() => {
    const overrides = JSON.parse(payload);
    const offs = frames.map((win) => {
      const channel = channelOf(win);
      if (!channel) return () => undefined;
      const send = () => channel.emit(SET_EVENT, { overrides });
      send();
      channel.on('storyRendered', send);
      return () => channel.off('storyRendered', send);
    });
    return () => offs.forEach((off) => off());
  }, [payload, frames, loads]);

  // Each edit as Changes and the agent task treat it.
  const statuses = useMemo(
    () => edits.map((e) => editStatus(e, specs, report)),
    [edits, specs, report]
  );

  const set = useCallback((e: InstanceEdit) => {
    setEdits((all) => putEdit(all, e));
  }, []);
  const remove = useCallback((e: InstanceEdit) => {
    setEdits((all) => all.filter((x) => editKey(x) !== editKey(e)));
  }, []);
  const clear = useCallback(() => setEdits([]), []);
  const dismiss = useCallback(() => setNotice(undefined), []);

  return {
    edits,
    statuses,
    set,
    remove,
    clear,
    report,
    specs,
    revision,
    notice,
    dismiss,
  };
};
