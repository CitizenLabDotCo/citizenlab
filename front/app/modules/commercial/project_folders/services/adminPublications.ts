import 'services/adminPublications';

declare module 'services/adminPublications' {
  export interface IAdminPublicationTypeMap {
    folder: 'folder';
  }
  export interface IQueryParametersWithPS {
    folder: string;
  }
}
