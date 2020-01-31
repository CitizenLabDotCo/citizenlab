import { Multiloc, ImageSizes } from 'typings';

// to extend
export interface IFolderData {
  id: string;
  type: 'folder';
  attributes: {
    title_multiloc: Multiloc; // Text, > 10
    description_multiloc: Multiloc; // HTML
    description_preview_multiloc: Multiloc; // Text
    slug: string;
    header_bg: ImageSizes;
  };
  relationships: {
    projects: {
      data: { id: string, type: 'project' }[];
    }
  };
}
