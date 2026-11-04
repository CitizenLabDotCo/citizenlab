// Mocks for the stories of the redesign's foundation and shared pieces that
// live outside the backofficeRedesign folder (library variants, shared UI,
// the New project flow, settings panel rows): spaces, folders and groups
// for the New project form, a tenant with two languages and spaces on, and
// an admin who opted into the redesign's early access.
import { http, HttpResponse } from 'msw';

import { getAppConfigurationData } from '../../app/api/app_configuration/__mocks__/_mockServer';
import { IFileAttachmentData } from '../../app/api/file_attachments/types';
import { IFileData } from '../../app/api/files/types';
import { IGroupData } from '../../app/api/groups/types';
import { mockAuthUserData } from '../../app/api/me/__mocks__/_mockServer';
import { MiniProjectFolder } from '../../app/api/project_folders_mini/types';
import { SpaceData } from '../../app/api/spaces/types';

import { backofficeRedesignHandlers } from './backofficeRedesign';

const API = '/web_api/v1';

const links = (path: string) => ({
  self: `${API}${path}?page%5Bnumber%5D=1`,
  first: `${API}${path}?page%5Bnumber%5D=1`,
  prev: null,
  next: null,
  last: `${API}${path}?page%5Bnumber%5D=1`,
});

const CREATED = '2026-03-02T09:00:00.000Z';

const spaceOf = (id: string, title: string): SpaceData => ({
  id,
  type: 'space',
  attributes: {
    title_multiloc: { en: title },
    description_multiloc: {},
    created_at: CREATED,
    updated_at: CREATED,
  },
  relationships: { moderators: { data: [] } },
});

export const mockSpaces: SpaceData[] = [
  spaceOf('bo-space-north', 'North district'),
  spaceOf('bo-space-centre', 'City centre'),
];

const folderOf = (
  id: string,
  title: string,
  space: SpaceData | null
): MiniProjectFolder => ({
  id,
  type: 'folder_mini',
  attributes: {
    title_multiloc: { en: title },
    visible_projects_count: 3,
    publication_status: 'published',
    space_id: space?.id ?? null,
    space_title_multiloc: space?.attributes.title_multiloc ?? null,
  },
  relationships: { moderators: { data: [] }, images: { data: [] } },
});

export const mockFolders: MiniProjectFolder[] = [
  folderOf('bo-folder-parks', 'Parks and green spaces', mockSpaces[0]),
  folderOf('bo-folder-mobility', 'Mobility plan 2030', mockSpaces[1]),
  folderOf('bo-folder-youth', 'Youth council', null),
];

const groupOf = (id: string, title: string, count: number): IGroupData => ({
  id,
  type: 'group',
  attributes: {
    title_multiloc: { en: title },
    membership_type: 'manual',
    memberships_count: count,
  },
});

export const mockGroups: IGroupData[] = [
  groupOf('bo-group-residents', 'Residents of the north', 412),
  groupOf('bo-group-youth', 'Youth council members', 24),
  groupOf('bo-group-staff', 'City staff', 87),
  groupOf('bo-group-shops', 'Shop owners', 56),
  groupOf('bo-group-schools', 'School teachers', 39),
];

const baseConfig = getAppConfigurationData();

/** Two languages (so locale tabs show), spaces and the redesign on. */
export const appConfigurationHandler = http.get(
  `${API}/app_configuration`,
  () =>
    HttpResponse.json({
      data: {
        ...baseConfig,
        attributes: {
          ...baseConfig.attributes,
          settings: {
            ...baseConfig.attributes.settings,
            core: {
              ...baseConfig.attributes.settings.core,
              locales: ['en', 'nl-BE'],
            },
            spaces: { allowed: true, enabled: true },
            project_backoffice_redesign: { allowed: true, enabled: true },
          },
        },
      },
    })
);

const meWith = (attributes: Record<string, unknown>) =>
  http.get(`${API}/users/me`, () =>
    HttpResponse.json({
      data: {
        ...mockAuthUserData,
        attributes: { ...mockAuthUserData.attributes, ...attributes },
      },
    })
  );

/** Offered the redesign and switched it on: the feedback notice shows. */
export const optedInHandler = meWith({
  offered_early_access_features: { project_backoffice_redesign: 'general' },
  early_access_opt_ins: ['project_backoffice_redesign'],
});

/** Offered the redesign but not switched on: the turn-on notice shows. */
export const offeredHandler = meWith({
  offered_early_access_features: { project_backoffice_redesign: 'general' },
  early_access_opt_ins: [],
});

export const spacesHandler = http.get(`${API}/spaces`, () =>
  HttpResponse.json({ data: mockSpaces })
);

export const foldersHandler = http.get(`${API}/project_folders/for_admin`, () =>
  HttpResponse.json({ data: mockFolders, links: links('/project_folders') })
);

export const groupsHandler = http.get(`${API}/groups`, () =>
  HttpResponse.json({ data: mockGroups, links: links('/groups') })
);

const fileOf = (id: string, name: string): IFileData => ({
  id,
  type: 'file',
  attributes: {
    title: name,
    name,
    mime_type: 'application/pdf',
    size: 820000,
    category: 'info_sheet',
    description_multiloc: {},
    ai_processing_allowed: false,
    created_at: CREATED,
    updated_at: CREATED,
    deleted_at: null,
    content: { url: `/files/${name}` },
  },
  relationships: {},
});

export const mockFiles: IFileData[] = [
  fileOf('bo-shared-file-1', 'Tree route map.pdf'),
  fileOf(
    'bo-shared-file-2',
    'Planting plan 2026 - full draft for residents, with the comments of the neighbourhood council.pdf'
  ),
];

export const mockAttachments: IFileAttachmentData[] = mockFiles.map(
  (file, index) => ({
    id: `bo-shared-attachment-${index + 1}`,
    type: 'file_attachment',
    attributes: {
      position: index,
      file_name: file.attributes.name,
      file_size: file.attributes.size,
      file_url: file.attributes.content.url,
      created_at: CREATED,
      updated_at: CREATED,
    },
    relationships: {
      attachable: { data: { id: 'bo-event-1', type: 'event' } },
      file: { data: { id: file.id, type: 'file' } },
    },
  })
);

export const filesHandler = http.get(`${API}/files/:id`, ({ params }) =>
  HttpResponse.json({
    data: mockFiles.find((f) => f.id === params.id) ?? mockFiles[0],
  })
);

/** Everything the shared pieces read, before the shared redesign mocks. */
export const sharedPiecesHandlers = [
  appConfigurationHandler,
  spacesHandler,
  foldersHandler,
  groupsHandler,
  filesHandler,
  ...backofficeRedesignHandlers,
];
