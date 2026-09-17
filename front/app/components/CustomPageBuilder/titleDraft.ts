import { SerializedNodes } from '@craftjs/core';
import { Multiloc } from 'typings';

import { findNodeIdByName } from './defaultLayout';

// The title renders from the page record, which also names the page in the admin list and the nav
// bar. The settings panel keeps edits in a prop; saving commits it to the page and strips it from
// the layout.

const hasText = (multiloc?: Multiloc): multiloc is Multiloc =>
  !!multiloc && Object.values(multiloc).some((value) => value.trim());

export const getTitleDraft = (nodes: SerializedNodes): Multiloc | undefined => {
  const titleId = findNodeIdByName(nodes, 'CustomPageTitle');
  if (!titleId) return undefined;

  const title = nodes[titleId].props.title as Multiloc | undefined;
  // A page must keep a name, so a title emptied in every locale is not committed.
  return hasText(title) ? title : undefined;
};

export const stripTitleDraft = (nodes: SerializedNodes): SerializedNodes => {
  const titleId = findNodeIdByName(nodes, 'CustomPageTitle');
  if (!titleId || nodes[titleId].props.title === undefined) return nodes;

  const { title: _title, ...props } = nodes[titleId].props;
  return { ...nodes, [titleId]: { ...nodes[titleId], props } };
};
