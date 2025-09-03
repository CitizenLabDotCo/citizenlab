import { Multiloc } from 'typings';

import { IdeaPublicationStatus } from 'api/ideas/types';

export interface FormValues {
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  author_id?: string;
  idea_images_attributes?: { image: string }[];
  idea_files_attributes?: {
    file_by_content: { content: string };
    name: string;
  }[];
  location_description?: string | null;
  location_point_geojson?: GeoJSON.Point | null;
  topic_ids?: string[];
  cosponsor_ids?: string[];
  publication_status?: IdeaPublicationStatus;
  anonymous?: boolean;
}
