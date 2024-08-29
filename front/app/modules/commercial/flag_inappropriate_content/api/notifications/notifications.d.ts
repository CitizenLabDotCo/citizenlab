import 'api/notifications/types';
import { RouteType } from 'routes';

declare module 'api/notifications/types' {
  export interface INLPFlagNotificationData extends IBaseNotificationData {
    attributes: {
      type: 'inappropriate_content_flagged';
      read_at: string | null;
      created_at: string;
      flaggable_path: RouteType;
    };
  }

  export interface INotificationDataMap {
    INLPFlagNotificationData: INLPFlagNotificationData;
  }
}
