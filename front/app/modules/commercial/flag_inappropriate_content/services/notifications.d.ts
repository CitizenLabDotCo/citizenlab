import 'services/notifications';

declare module 'services/notifications' {
  export interface INLPFlagNotificationData extends IBaseNotificationData {
    attributes: {
      type: 'inappropriate_content_flagged';
      read_at: string | null;
      created_at: string;
      flaggable_url: string;
    };
  }

  export interface INotificationDataMap {
    INLPFlagNotificationData: INLPFlagNotificationData;
  }
}
