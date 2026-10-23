// Connects the instance props registry (app/component-library/utils/
// gvInstance.ts) to the preview's channel, for the workbench:
// - `gvInstanceProps { overrides }` in: every instance override of the
//   session, per story id. The workbench sends it after checking each entry
//   against the component's argTypes; the registry keeps plain values only
//   and each component takes only the props it declares.
// - `gvInstanceReport { storyId, instances }` out: the mounted instances
//   with their place, values as rendered, and what code sets.
// The decorator tells the registry which story renders, before it does, so
// the story's overrides are there on its first render and the frame keeps
// them across a switch in place. Nothing runs without VITE_GV_DESIGN_TAGS.
import React from 'react';

import { StoryContext } from '@storybook/react';
import { addons } from 'storybook/preview-api';

import {
  designTagsOn,
  registryOf,
  scheduleReport,
  setOverrides,
  setScope,
} from '../app/component-library/utils/gvInstance';

import { REPORT_EVENT, SET_EVENT } from './instanceEvents';

import type { JSX } from 'react/jsx-runtime';

let connected = false;

const connect = () => {
  if (connected) return;
  connected = true;
  const channel = addons.getChannel();
  const reg = registryOf();
  const set = (payload: { overrides?: unknown } | undefined) =>
    setOverrides(reg, payload?.overrides);
  channel.on(SET_EVENT, set);
  // The workbench may have sent them before the first story rendered.
  const last = channel.last(SET_EVENT) as
    | [{ overrides?: unknown } | undefined]
    | undefined;
  if (last) set(last[0]);
  reg.onReport = (instances) =>
    channel.emit(REPORT_EVENT, { storyId: reg.scope, instances });
  scheduleReport(reg);
};

export const instancePropsDecorator = (
  Story: () => JSX.Element,
  context: StoryContext
) => {
  if (designTagsOn()) {
    connect();
    setScope(registryOf(), context.id);
  }
  return <Story />;
};
