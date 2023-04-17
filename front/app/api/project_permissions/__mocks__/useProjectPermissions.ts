import { IPCPermissionData } from '../types';

export const projectPermissionsData: IPCPermissionData = {
  id: '80419431-f691-4dc5-8aeb-5d14ece5feb0',
  type: 'permission',
  attributes: {
    action: 'commenting_idea',
    permitted_by: 'everyone_confirmed_email',
    created_at: '2023-03-28T12:29:20.848Z',
    updated_at: '2023-03-28T13:15:59.410Z',
  },
  relationships: {
    permission_scope: {
      data: {
        id: 'fc85a512-299f-43e1-8354-fc251de04cb7',
        type: 'project',
      },
    },
    groups: {
      data: [],
    },
  },
};

export default jest.fn(() => {
  return { data: { data: projectPermissionsData } };
});
