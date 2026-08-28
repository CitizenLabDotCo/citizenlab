import { SerializedNodes } from '@craftjs/core';
import { Multiloc } from 'typings';

import { ICustomPageAttributes } from 'api/custom_pages/types';

import { findNodeIdByName } from './defaultLayout';

// What the banner's settings panel may change. Everything here is a column on the page, so
// the draft is a partial record rather than a shape of its own — except the image, which is
// a base64 upload on the way in and sized URLs on the way back.
export type BannerDraft = Partial<
  Pick<
    ICustomPageAttributes,
    | 'banner_layout'
    | 'banner_header_multiloc'
    | 'banner_subheader_multiloc'
    | 'banner_overlay_color'
    | 'banner_overlay_opacity'
    | 'banner_cta_button_type'
    | 'banner_cta_button_multiloc'
    | 'banner_cta_button_url'
  >
> & {
  // Base64 for a new image, null for one the admin removed, absent for untouched.
  header_bg?: string | null;
};

// The header widgets render from the StaticPage record, not from layout props, so the page
// stays the source of truth and the legacy render path keeps working while the flag is off.
// Their settings panels park edits in craft props; the builder's save commits those to the
// page and strips them before storing the layout.
export type CustomPageAttributeDrafts = {
  titleMultiloc?: Multiloc;
  banner?: BannerDraft;
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

  const bannerId = findNodeIdByName(nodes, 'CustomPageBanner');
  if (bannerId) {
    const banner = nodes[bannerId].props.draft as BannerDraft | undefined;
    if (banner && Object.keys(banner).length > 0) {
      drafts.banner = banner;
    }
  }

  return drafts;
};

export const hasCustomPageAttributeDrafts = (
  drafts: CustomPageAttributeDrafts
) => drafts.titleMultiloc !== undefined || drafts.banner !== undefined;

export const stripCustomPageAttributeDrafts = (
  nodes: SerializedNodes
): SerializedNodes => {
  const next = { ...nodes };

  const titleId = findNodeIdByName(next, 'CustomPageTitle');
  if (titleId && next[titleId].props.title !== undefined) {
    const { title: _title, ...props } = next[titleId].props;
    next[titleId] = { ...next[titleId], props };
  }

  const bannerId = findNodeIdByName(next, 'CustomPageBanner');
  if (bannerId && next[bannerId].props.draft !== undefined) {
    const { draft: _draft, ...props } = next[bannerId].props;
    next[bannerId] = { ...next[bannerId], props };
  }

  return next;
};
