import { hasPermission } from 'utils/permissions/permissions';
import './rules/routePermissions';
import './rules/ideaPermissions';
import './rules/initiativePermissions';
import './rules/commentPermissions';
import './rules/projectPermissions';
import './rules/campaignPermissions';
import './rules/projectFolderPermissions';

export { hasPermission };

export * from './permissions';
