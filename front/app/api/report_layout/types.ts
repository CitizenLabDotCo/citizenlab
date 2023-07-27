import { Keys } from 'utils/cl-react-query/types';
import reportLayoutKeys from './keys';
import { JsonMultiloc } from 'components/admin/ContentBuilder/typings';

export type ReportLayoutKeys = Keys<typeof reportLayoutKeys>;

export interface ReportLayout {
  id: string;
  type: 'content_builder_layout';
  attributes: {
    enabled: boolean;
    code: 'report';
    created_at: string;
    updated_at: string;
    craftjs_jsonmultiloc: JsonMultiloc;
  };
}

export interface ReportLayoutResponse {
  data: ReportLayout;
}
