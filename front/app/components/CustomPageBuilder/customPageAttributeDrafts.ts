import { SerializedNodes } from '@craftjs/core';
import { Multiloc } from 'typings';

import { findNodeIdByName } from './defaultLayout';

// The header widgets render from the StaticPage record, not from layout props, so the page
// stays the source of truth and the legacy render path keeps working while the flag is off.
// Their settings panels park edits in craft props; the builder's save commits those to the
// page and strips them before storing the layout.
export type CustomPageAttributeDrafts = {
  titleMultiloc?: Multiloc;
};

const hasText = (multiloc?: Multiloc): multiloc is Multiloc =>
  !!multiloc && Object.values(multiloc).some((value) => value.trim());

export const extractCustomPageAttributeDrafts = (
  nodes: SerializedNodes
): CustomPageAttributeDrafts => {
  const drafts: CustomPageAttributeDrafts = {};

  const titleId = findNodeIdByName(nodes, 'CustomPageTitle');
  if (titleId) {
    const title = nodes[titleId].props.title as Multiloc | undefined;
    // A page must keep a name, so a title emptied in every locale is not committed.
    if (hasText(title)) {
      drafts.titleMultiloc = title;
    }
  }

  return drafts;
};

export const hasCustomPageAttributeDrafts = (
  drafts: CustomPageAttributeDrafts
) => drafts.titleMultiloc !== undefined;

export const stripCustomPageAttributeDrafts = (
  nodes: SerializedNodes
): SerializedNodes => {
  const next = { ...nodes };

  const titleId = findNodeIdByName(next, 'CustomPageTitle');
  if (titleId && next[titleId].props.title !== undefined) {
    const { title: _title, ...props } = next[titleId].props;
    next[titleId] = { ...next[titleId], props };
  }

  return next;
};
