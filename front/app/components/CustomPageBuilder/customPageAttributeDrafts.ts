import { SerializedNodes } from '@craftjs/core';
import { Multiloc } from 'typings';

import { findNodeIdByName } from './defaultLayout';

// The title renders from the page record, which also names the page in the admin list and the nav
// bar. The settings panel keeps edits in a prop; saving commits it to the page and strips it from
// the layout.
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
