import { SerializedNodes } from '@craftjs/core';
import { Multiloc } from 'typings';

import { findNodeIdByName } from './defaultLayout';

// The title widget renders from the StaticPage record, not from layout props: title_multiloc
// also names the page in the admin list and is the nav bar item's fallback title. Its settings
// panel parks edits in a craft prop; the builder's save commits that to the page and strips it
// before storing the layout, as the project page builder does.
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
