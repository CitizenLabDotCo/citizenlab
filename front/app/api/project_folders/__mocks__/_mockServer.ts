import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { projectFolderData } from './data';

const projectFolderPath = `${API_PATH}/project_folders/:id`;

const endpoints = {
  'GET project_folders/:id': http.get(projectFolderPath, ({ params }) => {
    return HttpResponse.json(
      {
        ...projectFolderData,
        data: { ...projectFolderData.data, id: params.id },
      },
      { status: 200 }
    );
  }),
};

export default endpoints;
