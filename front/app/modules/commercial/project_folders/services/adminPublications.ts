import 'services/adminPublications';

declare module 'services/adminPublications' {
  export interface IAdminPublicationTypeMap {
    folder: 'folder';
  }
  export interface IQueryParametersBase {
    folder?: string;
  }
}
