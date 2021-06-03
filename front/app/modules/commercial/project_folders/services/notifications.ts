import { Multiloc } from 'typings';

declare module 'services/notifications' {
  export interface IProjectFolderModerationRightsReceivedNotificationData
    extends IBaseNotificationData {
    attributes: {
      type: 'project_folder_moderation_rights_received';
      read_at: string | null;
      created_at: string;
      project_folder_id: string;
      project_folder_title_multiloc: Multiloc;
    };
  }

  export interface INotificationDataMap {
    IProjectFolderModerationRightsReceivedNotificationData: IProjectFolderModerationRightsReceivedNotificationData;
  }
}
