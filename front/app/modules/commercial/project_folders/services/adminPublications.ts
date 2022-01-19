import 'services/adminPublications';

declare module 'services/adminPublications' {
  export interface IAdminPublicationTypeMap {
    folder: 'folder';
  }
  export interface IQueryParameters {
    folder?: string;
  }
}
