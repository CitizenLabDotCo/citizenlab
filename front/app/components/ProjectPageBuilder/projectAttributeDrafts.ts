import { SerializedNodes } from '@craftjs/core';
import { Multiloc } from 'typings';

import { findNodeIdByName } from './defaultLayout';

export type BannerImageDraft = {
  dataCode?: string;
  imageUrl?: string;
  removed?: boolean;
};

export type ProjectAttributeDrafts = {
  titleMultiloc?: Multiloc;
  bannerImageUrl?: string;
  bannerRemoved?: boolean;
  bannerAltMultiloc?: Multiloc;
};

const isNonEmptyMultiloc = (multiloc?: Multiloc): multiloc is Multiloc =>
  !!multiloc && Object.keys(multiloc).length > 0;

export const extractProjectAttributeDrafts = (
  nodes: SerializedNodes
): ProjectAttributeDrafts => {
  const drafts: ProjectAttributeDrafts = {};

  const titleId = findNodeIdByName(nodes, 'ProjectTitle');
  if (titleId) {
    const title = nodes[titleId].props.title as Multiloc | undefined;
    if (
      isNonEmptyMultiloc(title) &&
      Object.values(title).some((value) => value && value.trim())
    ) {
      drafts.titleMultiloc = title;
    }
  }

  const bannerId = findNodeIdByName(nodes, 'ProjectBanner');
  if (bannerId) {
    const image = nodes[bannerId].props.image as BannerImageDraft | undefined;
    if (image?.imageUrl) {
      drafts.bannerImageUrl = image.imageUrl;
    } else if (image?.removed) {
      drafts.bannerRemoved = true;
    }
    const alt = nodes[bannerId].props.alt as Multiloc | undefined;
    if (isNonEmptyMultiloc(alt)) {
      drafts.bannerAltMultiloc = alt;
    }
  }

  return drafts;
};

export const hasProjectAttributeDrafts = (drafts: ProjectAttributeDrafts) =>
  drafts.titleMultiloc !== undefined ||
  drafts.bannerImageUrl !== undefined ||
  drafts.bannerRemoved === true ||
  drafts.bannerAltMultiloc !== undefined;

export const stripProjectAttributeDrafts = (
  nodes: SerializedNodes
): SerializedNodes => {
  const next = { ...nodes };

  const titleId = findNodeIdByName(next, 'ProjectTitle');
  if (titleId && next[titleId].props.title !== undefined) {
    const { title: _title, ...props } = next[titleId].props;
    next[titleId] = { ...next[titleId], props };
  }

  const bannerId = findNodeIdByName(next, 'ProjectBanner');
  if (bannerId) {
    next[bannerId] = {
      ...next[bannerId],
      props: { ...next[bannerId].props, image: {}, alt: {} },
    };
  }

  return next;
};
