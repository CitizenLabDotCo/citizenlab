import { hasPermission } from 'services/permissions/permissions';
import './rules/campaignPermissions';
import './rules/commentPermissions';
import './rules/ideaPermissions';
import './rules/initiativePermissions';
import './rules/projectFolderPermissions';
import './rules/projectPermissions';
import './rules/routePermissions';

export { hasPermission };

export * from './permissions';
