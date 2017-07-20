export interface IRelationship {
  id: string;
  type: string;
}

declare interface Message {
  id: string;
  defaultMessage: string;
}

declare interface Multiloc {
  [key: string]: string;
}
