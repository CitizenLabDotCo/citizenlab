import * as yup from 'yup';

import { reviewStates } from 'api/admin_publications/types';
import { projectSortableParams } from 'api/projects_mini_admin/types';

// Projects index (list) - filter params for the project list page.
// Multiselect params (status, managers, etc.) are stored as JSON-encoded
// strings in the URL; the useParam/useParams hooks in params.ts handle
// parsing. Also used to validate the params restored by usePersistedParams.
export const projectsIndexSearchSchema = yup.object({
  tab: yup
    .string()
    .oneOf(['calendar', 'folders', 'spaces', 'ordering'])
    .optional(),
  sort: yup.string().oneOf(projectSortableParams).optional(),
  review_state: yup.string().oneOf(reviewStates).optional(),
  search: yup.string().optional(),
  min_start_date: yup.string().optional(),
  max_start_date: yup.string().optional(),
  // Array params encoded as ?key=["a","b"] in the URL — TanStack's default
  // parser turns them into arrays before validation.
  status: yup.array().of(yup.string().required()).optional(),
  managers: yup.array().of(yup.string().required()).optional(),
  participation_states: yup.array().of(yup.string().required()).optional(),
  folder_ids: yup.array().of(yup.string().required()).optional(),
  participation_methods: yup.array().of(yup.string().required()).optional(),
  visibility: yup.array().of(yup.string().required()).optional(),
  discoverability: yup.array().of(yup.string().required()).optional(),
  space_ids: yup.array().of(yup.string().required()).optional(),
});
