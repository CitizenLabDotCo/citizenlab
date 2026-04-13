export type ModalName =
  | 'block-user'
  | 'unblock-user'
  | 'delete-user'
  | 'set-moderator'
  | 'seat-limit-reached';

export type Action =
  | 'unblock-user'
  | 'block-user'
  | 'set-admin'
  | 'set-moderator'
  | 'set-normal-user'
  | 'delete-user';
