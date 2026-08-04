/**
 * An icon image uploaded through the settings panel. Mirrors the shape used by
 * the other content builder widgets that hold an image, so that the back end
 * can swap `imageUrl` for `dataCode` on save and restore it on read.
 */
export interface CustomPageIconImage {
  dataCode?: string;
  imageUrl?: string;
}

export interface CustomPageItem {
  id: string;
  /** Emoji used as card icon. Mutually exclusive with `image`. */
  icon?: string | null;
  /** Uploaded image used as card icon. Mutually exclusive with `icon`. */
  image?: CustomPageIconImage | null;
}
